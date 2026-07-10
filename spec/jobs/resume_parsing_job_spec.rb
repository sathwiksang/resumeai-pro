require "rails_helper"

RSpec.describe ResumeParsingJob, type: :job do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }

  before { ActsAsTenant.current_tenant = organization }
  after { ActsAsTenant.current_tenant = nil }

  describe "#perform" do
    let(:resume) { create(:resume, user: user, organization: organization) }

    before do
      resume.document.attach(
        io: StringIO.new("John Doe\nSoftware Engineer\n5 years of Ruby experience"),
        filename: "resume.txt",
        content_type: "text/plain"
      )
    end

    context "with successful parsing and embedding" do
      before do
        stub_request(:post, "http://localhost:11434/api/embed")
          .to_return(
            status: 200,
            body: { embeddings: [Array.new(768) { 0.1 }] }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "parses the document and updates the resume" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("parsed")
        expect(resume.raw_text).to include("John Doe")
        expect(resume.raw_text).to include("Software Engineer")
        expect(resume.content_digest).to be_present
        expect(resume.content_digest.length).to eq(64)
      end

      it "generates an embedding" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.embedding).to be_present
        expect(resume.embedding.length).to eq(768)
      end

      it "chains to ResumeExtractionJob" do
        expect(ResumeExtractionJob).to receive(:perform_later).with(resume.id)
        described_class.perform_now(resume.id)
      end
    end

    context "when Ollama is unreachable" do
      before do
        stub_request(:post, "http://localhost:11434/api/embed")
          .to_raise(Faraday::ConnectionFailed.new("Connection refused"))
      end

      it "still parses the document successfully" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("parsed")
        expect(resume.raw_text).to include("John Doe")
      end

      it "sets embedding to nil" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.embedding).to be_nil
      end

      it "still chains to ResumeExtractionJob" do
        expect(ResumeExtractionJob).to receive(:perform_later).with(resume.id)
        described_class.perform_now(resume.id)
      end
    end

    context "when document parsing fails" do
      before do
        allow(DocumentParser).to receive(:parse)
          .and_raise(DocumentParser::ParseError, "Corrupt file")
      end

      it "marks the resume as error with message" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("error")
        expect(resume.error_message).to eq("Corrupt file")
      end

      it "does not chain to extraction job" do
        expect(ResumeExtractionJob).not_to receive(:perform_later)
        described_class.perform_now(resume.id)
      end
    end

    context "when file format is unsupported" do
      before do
        allow(DocumentParser).to receive(:parse)
          .and_raise(DocumentParser::UnsupportedFormatError, "Unsupported format: application/zip")
      end

      it "marks resume as error" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("error")
        expect(resume.error_message).to include("Unsupported format")
      end
    end

    context "when file is too large" do
      before do
        allow(DocumentParser).to receive(:parse)
          .and_raise(DocumentParser::FileTooLargeError, "File exceeds 10MB limit")
      end

      it "marks resume as error" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("error")
        expect(resume.error_message).to include("10MB")
      end
    end
  end

  describe "when resume is not found" do
    it "discards the job without error" do
      expect { described_class.perform_now(-1) }.not_to raise_error
    end
  end

  describe "job configuration" do
    it "is enqueued in the default queue" do
      expect(described_class.new.queue_name).to eq("default")
    end
  end
end
