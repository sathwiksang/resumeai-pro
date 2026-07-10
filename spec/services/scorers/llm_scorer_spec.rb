require "rails_helper"

RSpec.describe Scorers::LlmScorer do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }

  before { ActsAsTenant.current_tenant = organization }
  after { ActsAsTenant.current_tenant = nil }

  let(:resume) do
    create(:resume, :parsed, user: user, organization: organization,
      raw_text: "John Doe\nSenior Ruby Developer\n5 years Rails experience\nBS Computer Science")
  end

  let(:job_description) do
    create(:job_description, :ready, user: user, organization: organization,
      title: "Senior Software Engineer",
      company: "TechCorp",
      description: "We need a senior Ruby developer with 5+ years experience.",
      required_skills: ["Ruby", "Rails"],
      preferred_skills: ["React"])
  end

  let(:llm_evaluation) do
    {
      "skills_match" => {
        "score" => 85,
        "evidence" => "Strong Ruby and Rails match",
        "matched_skills" => ["Ruby", "Rails"],
        "missing_critical" => [],
        "transferable" => []
      },
      "experience_relevance" => {
        "score" => 80,
        "evidence" => "5 years of relevant experience",
        "years_relevant" => 5,
        "years_required" => 5,
        "role_alignment" => "strong"
      },
      "education_fit" => {
        "score" => 90,
        "evidence" => "BS in Computer Science matches"
      },
      "format_quality" => {
        "score" => 75,
        "issues" => ["Could use more bullet points"]
      },
      "content_quality" => {
        "score" => 70,
        "has_quantified_achievements" => false,
        "action_verb_usage" => "moderate",
        "issues" => ["Lacks quantified achievements"]
      },
      "overall_assessment" => "Strong candidate for the role."
    }
  end

  describe "#score" do
    context "with successful LLM response" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: {
              message: { content: llm_evaluation.to_json },
              model: "qwen2.5:3b",
              eval_count: 200,
              prompt_eval_count: 500
            }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "returns evaluation with all dimensions" do
        result = described_class.new(resume, job_description).score

        expect(result).to include("skills_match", "experience_relevance",
                                  "education_fit", "format_quality", "content_quality")
      end

      it "calculates weighted overall score" do
        result = described_class.new(resume, job_description).score

        expected = (85 * 0.35 + 80 * 0.30 + 90 * 0.15 + 75 * 0.10 + 70 * 0.10).round(1)
        expect(result["overall_score"]).to eq(expected)
      end

      it "includes model metadata" do
        result = described_class.new(resume, job_description).score

        expect(result["model"]).to eq("qwen2.5:3b")
        expect(result["eval_count"]).to eq(200)
      end

      it "preserves dimension details" do
        result = described_class.new(resume, job_description).score

        expect(result["skills_match"]["matched_skills"]).to include("Ruby", "Rails")
        expect(result["experience_relevance"]["role_alignment"]).to eq("strong")
      end
    end

    context "when LLM returns markdown-wrapped JSON" do
      before do
        wrapped = "```json\n#{llm_evaluation.to_json}\n```"
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: { message: { content: wrapped }, model: "qwen2.5:3b" }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "strips wrappers and parses correctly" do
        result = described_class.new(resume, job_description).score

        expect(result["skills_match"]["score"]).to eq(85)
      end
    end

    context "when LLM returns invalid JSON" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_return(
            status: 200,
            body: { message: { content: "I cannot evaluate this." }, model: "qwen2.5:3b" }.to_json,
            headers: { "Content-Type" => "application/json" }
          )
      end

      it "returns default evaluation with zero scores" do
        result = described_class.new(resume, job_description).score

        expect(result["overall_score"]).to eq(0.0)
        expect(result["skills_match"]["score"]).to eq(0)
      end
    end

    context "when Ollama is unreachable" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_raise(Faraday::ConnectionFailed.new("Connection refused"))
      end

      it "raises ConnectionError" do
        expect {
          described_class.new(resume, job_description).score
        }.to raise_error(OllamaService::ConnectionError)
      end
    end
  end
end
