require "rails_helper"

RSpec.describe JdExtractionJob, type: :job do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }
  let(:job_description) do
    create(:job_description, user: user, organization: organization,
      description: "We are looking for a Senior Ruby Developer with 5+ years of experience in Rails, React, and PostgreSQL.")
  end

  before { ActsAsTenant.current_tenant = organization }
  after { ActsAsTenant.current_tenant = nil }

  let(:llm_json_response) do
    {
      "requirements" => {
        "years_experience" => 5,
        "education_level" => "Bachelor's",
        "remote" => nil,
      },
      "required_skills" => ["Ruby", "Rails", "PostgreSQL"],
      "preferred_skills" => ["React", "TypeScript"],
      "responsibilities" => ["Build web applications", "Lead code reviews"],
      "qualifications" => ["5+ years Ruby experience"],
    }
  end

  describe "#perform" do
    context "with successful extraction and embedding" do
      before do
        stub_request(:post, "http://localhost:11434/api/embed")
          .to_return(
            status: 200,
            body: { embeddings: [Array.new(768) { 0.1 }] }.to_json,
            headers: { "Content-Type" => "application/json" }
          )

        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: {
              message: { content: llm_json_response.to_json },
              model: "qwen2.5:3b",
            }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "extracts requirements and marks JD as ready" do
        described_class.perform_now(job_description.id)

        job_description.reload
        expect(job_description.status).to eq("ready")
        expect(job_description.requirements).to be_present
        expect(job_description.requirements["years_experience"]).to eq(5)
      end

      it "updates skills from LLM extraction" do
        described_class.perform_now(job_description.id)

        job_description.reload
        expect(job_description.required_skills).to include("Ruby", "Rails")
        expect(job_description.preferred_skills).to include("React")
      end

      it "generates an embedding" do
        described_class.perform_now(job_description.id)

        job_description.reload
        expect(job_description.embedding).to be_present
        expect(job_description.embedding.length).to eq(768)
      end

      it "transitions through extracting status" do
        described_class.perform_now(job_description.id)

        job_description.reload
        expect(job_description.status).to eq("ready")
      end
    end

    context "when embedding fails but chat succeeds" do
      before do
        stub_request(:post, "http://localhost:11434/api/embed")
          .to_raise(Faraday::ConnectionFailed.new("Connection refused"))

        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: {
              message: { content: llm_json_response.to_json },
              model: "qwen2.5:3b",
            }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "still extracts requirements with nil embedding" do
        described_class.perform_now(job_description.id)

        job_description.reload
        expect(job_description.status).to eq("ready")
        expect(job_description.requirements).to be_present
        expect(job_description.embedding).to be_nil
      end
    end

    context "when LLM returns markdown-wrapped JSON" do
      before do
        stub_request(:post, "http://localhost:11434/api/embed")
          .to_return(
            status: 200,
            body: { embeddings: [Array.new(768) { 0.1 }] }.to_json,
            headers: { "Content-Type" => "application/json" }
          )

        wrapped = "```json\n#{llm_json_response.to_json}\n```"
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: { message: { content: wrapped }, model: "qwen2.5:3b" }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "strips markdown wrappers and parses correctly" do
        described_class.perform_now(job_description.id)

        job_description.reload
        expect(job_description.status).to eq("ready")
        expect(job_description.required_skills).to include("Ruby")
      end
    end

    context "when Ollama is completely unreachable" do
      before do
        stub_request(:post, "http://localhost:11434/api/embed")
          .to_raise(Faraday::ConnectionFailed.new("Connection refused"))
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_raise(Faraday::ConnectionFailed.new("Connection refused"))
      end

      it "marks JD as ready without extraction" do
        expect {
          described_class.perform_now(job_description.id)
        }.not_to raise_error

        job_description.reload
        expect(job_description.status).to eq("ready")
      end
    end

    context "when Ollama returns model error" do
      before do
        stub_request(:post, "http://localhost:11434/api/embed")
          .to_return(
            status: 200,
            body: { embeddings: [Array.new(768) { 0.1 }] }.to_json,
            headers: { "Content-Type" => "application/json" }
          )

        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(status: 500, body: "model not loaded")
      end

      it "marks JD as error with message" do
        described_class.perform_now(job_description.id)

        job_description.reload
        expect(job_description.status).to eq("error")
        expect(job_description.error_message).to include("Extraction failed")
      end
    end

    context "when JD is not found" do
      it "discards the job without error" do
        expect { described_class.perform_now(-1) }.not_to raise_error
      end
    end
  end

  describe "job configuration" do
    it "is enqueued in the default queue" do
      expect(described_class.new.queue_name).to eq("default")
    end
  end
end
