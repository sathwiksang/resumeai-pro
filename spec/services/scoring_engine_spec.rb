require "rails_helper"

RSpec.describe ScoringEngine do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }

  before { ActsAsTenant.current_tenant = organization }
  after { ActsAsTenant.current_tenant = nil }

  let(:embedding) { Array.new(768) { |i| Math.sin(i * 0.01) } }

  let(:resume) do
    create(:resume, :parsed, user: user, organization: organization,
      raw_text: "John Doe\nSenior Ruby Developer with 5 years experience in Rails, React, and PostgreSQL",
      embedding: embedding,
      parsed_data: {
        "skills" => { "technical" => ["Ruby", "Rails", "PostgreSQL", "React"] },
        "experience" => [{ "title" => "Senior Developer", "achievements" => ["Led team of 5"] }],
        "education" => [{ "degree" => "BS Computer Science", "institution" => "MIT" }]
      })
  end

  let(:job_description) do
    create(:job_description, :ready, user: user, organization: organization,
      embedding: embedding,
      required_skills: ["Ruby", "Rails", "PostgreSQL"],
      preferred_skills: ["React", "Docker"],
      requirements: {
        "responsibilities" => ["Build web applications"],
        "qualifications" => ["5+ years Ruby experience"]
      })
  end

  let(:llm_response) do
    {
      "skills_match" => { "score" => 80, "matched_skills" => ["Ruby", "Rails"], "missing_critical" => [], "transferable" => [] },
      "experience_relevance" => { "score" => 75, "role_alignment" => "strong", "years_relevant" => 5, "years_required" => 5 },
      "education_fit" => { "score" => 85, "evidence" => "Good match" },
      "format_quality" => { "score" => 70, "issues" => [] },
      "content_quality" => { "score" => 65, "has_quantified_achievements" => true, "action_verb_usage" => "strong", "issues" => [] },
      "overall_assessment" => "Strong candidate"
    }
  end

  before do
    stub_request(:post, "http://localhost:11434/api/chat")
      .to_return(
        status: 200,
        body: {
          message: { content: llm_response.to_json },
          model: "qwen2.5:3b",
          eval_count: 150,
          prompt_eval_count: 400
        }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  describe ".analyze" do
    it "creates a ResumeScore record" do
      expect { ScoringEngine.analyze(resume, job_description) }.to change(ResumeScore, :count).by(1)
    end

    it "returns the created ResumeScore" do
      result = ScoringEngine.analyze(resume, job_description)

      expect(result).to be_a(ResumeScore)
      expect(result).to be_persisted
      expect(result.status).to eq("completed")
    end

    it "calculates composite score from all three scorers" do
      result = ScoringEngine.analyze(resume, job_description)

      expect(result.overall_score).to be_between(0, 100)
      expect(result.keyword_score).to be_between(0, 100)
      expect(result.semantic_score).to be_between(0, 100)
      expect(result.skills_score).to be_present
    end

    it "assigns a grade based on overall score" do
      result = ScoringEngine.analyze(resume, job_description)

      expect(result.grade).to be_present
      expect(ResumeScore::GRADE_THRESHOLDS.keys).to include(result.grade)
    end

    it "populates all component scores" do
      result = ScoringEngine.analyze(resume, job_description)

      expect(result.keyword_score).to be_present
      expect(result.semantic_score).to be_present
      expect(result.skills_score).to be_present
      expect(result.experience_score).to be_present
      expect(result.education_score).to be_present
      expect(result.format_score).to be_present
    end

    it "populates JSONB analysis fields" do
      result = ScoringEngine.analyze(resume, job_description)

      expect(result.keyword_analysis).to be_a(Hash)
      expect(result.skills_analysis).to be_a(Hash)
      expect(result.experience_analysis).to be_a(Hash)
      expect(result.recommendations).to be_an(Array)
      expect(result.strengths).to be_an(Array)
      expect(result.weaknesses).to be_an(Array)
    end

    it "records processing metadata" do
      result = ScoringEngine.analyze(resume, job_description)

      expect(result.llm_model).to be_present
      expect(result.llm_tokens_used).to be > 0
      expect(result.processing_time_seconds).to be >= 0
      expect(result.content_pair_digest).to be_present
      expect(result.content_pair_digest.length).to eq(64)
    end

    it "sets organization, user, and associations" do
      result = ScoringEngine.analyze(resume, job_description)

      expect(result.organization).to eq(organization)
      expect(result.user).to eq(user)
      expect(result.resume).to eq(resume)
      expect(result.job_description).to eq(job_description)
    end

    it "updates an existing queued score instead of creating another record" do
      queued = create(:resume_score, :queued, organization: organization, user: user,
        resume: resume, job_description: job_description)

      expect {
        result = ScoringEngine.analyze(resume, job_description, existing_score: queued, user_id: user.id)
        expect(result.id).to eq(queued.id)
      }.not_to change(ResumeScore, :count)

      queued.reload
      expect(queued.status).to eq("completed")
      expect(queued.overall_score).to be_present
    end
  end

  describe "caching" do
    it "returns cached score for identical content pairs" do
      first = ScoringEngine.analyze(resume, job_description)
      second = ScoringEngine.analyze(resume, job_description)

      expect(second.id).to eq(first.id)
    end

    it "creates new score for different pairs" do
      ScoringEngine.analyze(resume, job_description)

      other_jd = create(:job_description, :ready, user: user, organization: organization,
        description: "Completely different job requiring Java and Spring Boot",
        embedding: Array.new(768) { |i| Math.cos(i * 0.02) })

      expect { ScoringEngine.analyze(resume, other_jd) }.to change(ResumeScore, :count).by(1)
    end
  end

  describe "graceful degradation" do
    context "when LLM is unavailable" do
      before do
        stub_request(:post, "http://localhost:11434/api/chat")
          .to_raise(Faraday::ConnectionFailed.new("Connection refused"))
      end

      it "still creates a score using keyword and semantic only" do
        result = ScoringEngine.analyze(resume, job_description)

        expect(result).to be_a(ResumeScore)
        expect(result.status).to eq("completed")
        expect(result.keyword_score).to be > 0
        expect(result.semantic_score).to be > 0
      end
    end
  end

  describe "strengths extraction" do
    it "identifies strengths from keyword and LLM results" do
      result = ScoringEngine.analyze(resume, job_description)

      strength_categories = result.strengths.map { |s| s["category"] || s[:category] }
      expect(strength_categories).to include("skills")
    end
  end

  describe "weaknesses extraction" do
    let(:llm_response) do
      {
        "skills_match" => { "score" => 40, "matched_skills" => ["Ruby"], "missing_critical" => ["Kubernetes", "Terraform"], "transferable" => [] },
        "experience_relevance" => { "score" => 30, "role_alignment" => "weak" },
        "education_fit" => { "score" => 50 },
        "format_quality" => { "score" => 60, "issues" => ["Too long", "Inconsistent formatting"] },
        "content_quality" => { "score" => 45, "has_quantified_achievements" => false, "action_verb_usage" => "weak", "issues" => ["Lacks metrics"] },
        "overall_assessment" => "Weak match"
      }
    end

    it "identifies weaknesses from analysis" do
      result = ScoringEngine.analyze(resume, job_description)

      weakness_categories = result.weaknesses.map { |w| w["category"] || w[:category] }
      expect(weakness_categories).to include("skills")
    end
  end
end
