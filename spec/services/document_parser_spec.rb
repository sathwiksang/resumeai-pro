require "rails_helper"

RSpec.describe DocumentParser do
  let(:txt_fixture) { Rails.root.join("spec/fixtures/files/sample_resume.txt") }

  describe ".parse" do
    context "with a valid text file" do
      it "extracts text and returns parsed result" do
        result = DocumentParser.parse(txt_fixture.to_s, content_type: "text/plain")

        expect(result[:raw_text]).to include("John Doe")
        expect(result[:raw_text]).to include("Senior Software Engineer")
        expect(result[:word_count]).to be > 100
        expect(result[:content_digest]).to be_a(String)
        expect(result[:content_digest].length).to eq(64) # SHA-256 hex
        expect(result[:parsed_at]).to be_a(Time)
      end

      it "cleans the extracted text" do
        result = DocumentParser.parse(txt_fixture.to_s, content_type: "text/plain")
        expect(result[:raw_text]).not_to include("\r\n")
        expect(result[:raw_text]).not_to include("\x00")
      end
    end

    context "with unsupported content type" do
      it "raises UnsupportedFormatError" do
        expect {
          DocumentParser.parse(txt_fixture.to_s, content_type: "application/zip")
        }.to raise_error(DocumentParser::UnsupportedFormatError)
      end
    end

    context "with non-existent file" do
      it "raises ParseError" do
        expect {
          DocumentParser.parse("/tmp/nonexistent_file.pdf", content_type: "application/pdf")
        }.to raise_error(DocumentParser::ParseError, /File not found/)
      end
    end

    context "with oversized file" do
      it "raises FileTooLargeError" do
        # Create a temp file that would exceed the limit check
        allow(File).to receive(:size).and_return(11.megabytes)
        allow(File).to receive(:exist?).and_return(true)

        expect {
          DocumentParser.parse("/tmp/large_file.pdf", content_type: "application/pdf")
        }.to raise_error(DocumentParser::FileTooLargeError)
      end
    end
  end

  describe "SUPPORTED_TYPES" do
    it "includes PDF, DOCX, and TXT" do
      expect(DocumentParser::SUPPORTED_TYPES).to include("application/pdf")
      expect(DocumentParser::SUPPORTED_TYPES).to include(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
      expect(DocumentParser::SUPPORTED_TYPES).to include("text/plain")
    end
  end
end
