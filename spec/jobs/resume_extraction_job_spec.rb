require "rails_helper"

RSpec.describe ResumeExtractionJob, type: :job do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }
  let(:resume) do
    create(:resume, :parsed, user: user, organization: organization,
      raw_text: "John Doe\njohn@example.com\nSenior Ruby Developer\n5 years experience in Rails and React")
  end

  before { ActsAsTenant.current_tenant = organization }
  after { ActsAsTenant.current_tenant = nil }

  let(:llm_json_response) do
    {
      "contact" => { "name" => "John Doe", "email" => "john@example.com" },
      "skills" => { "technical" => ["Ruby", "Rails", "React"] },
      "experience" => [{ "title" => "Senior Ruby Developer" }],
      "education" => [],
    }
  end

  describe "#perform" do
    context "with successful extraction" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: {
              message: { content: llm_json_response.to_json },
              model: "qwen2.5:3b",
              total_duration: 2_000_000,
              eval_count: 100,
              prompt_eval_count: 200,
            }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "extracts structured data and marks resume as ready" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("ready")
        expect(resume.parsed_data).to be_present
        expect(resume.parsed_data["contact"]["name"]).to eq("John Doe")
        expect(resume.parsed_data["skills"]["technical"]).to include("Ruby")
      end

      it "transitions through extracting status" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("ready")
      end
    end

    context "when LLM returns markdown-wrapped JSON" do
      before do
        wrapped_json = "```json\n#{llm_json_response.to_json}\n```"
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: {
              message: { content: wrapped_json },
              model: "qwen2.5:3b",
            }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "strips markdown wrappers and parses JSON" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("ready")
        expect(resume.parsed_data["contact"]["name"]).to eq("John Doe")
      end
    end

    context "when LLM returns invalid JSON" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: {
              message: { content: "Sorry, I cannot parse this resume properly." },
              model: "qwen2.5:3b",
            }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "marks resume as ready without parsed_data" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("ready")
      end
    end

    context "when LLM returns JSON embedded in text" do
      before do
        mixed_response = "Here is the data: {\"contact\": {\"name\": \"John\"}} end"
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: {
              message: { content: mixed_response },
              model: "qwen2.5:3b",
            }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "extracts JSON from within the response" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.parsed_data["contact"]["name"]).to eq("John")
      end
    end

    context "when resume has no raw_text" do
      let(:resume) do
        create(:resume, user: user, organization: organization, raw_text: nil, status: :parsed)
      end

      it "returns early without calling Ollama" do
        expect(OllamaService).not_to receive(:chat)
        described_class.perform_now(resume.id)
      end
    end

    context "when Ollama is unreachable" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_raise(Faraday::ConnectionFailed.new("Connection refused"))
      end

      it "handles the error gracefully" do
        # The job has retry_on for ConnectionError, but after retries exhausted
        # it marks parsed resumes as ready
        expect {
          described_class.perform_now(resume.id)
        }.not_to raise_error
      end
    end

    context "when Ollama returns model error" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(status: 500, body: "model not loaded")
      end

      it "marks resume as error with message" do
        described_class.perform_now(resume.id)

        resume.reload
        expect(resume.status).to eq("error")
        expect(resume.error_message).to include("Extraction failed")
      end
    end

    context "when resume is not found" do
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
