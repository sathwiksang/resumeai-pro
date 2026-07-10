require "rails_helper"

RSpec.describe ScoringJob, type: :job do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }

  before { ActsAsTenant.current_tenant = organization }
  after { ActsAsTenant.current_tenant = nil }

  let(:resume) do
    create(:resume, :ready, user: user, organization: organization,
      raw_text: "John Doe\nSenior Ruby Developer\n5 years experience",
      embedding: Array.new(768) { 0.1 },
      parsed_data: {
        "skills" => { "technical" => ["Ruby", "Rails"] },
        "experience" => [{ "title" => "Developer" }]
      })
  end

  let(:job_description) do
    create(:job_description, :ready, user: user, organization: organization,
      embedding: Array.new(768) { 0.1 },
      required_skills: ["Ruby", "Rails"])
  end

  let(:llm_response) do
    {
      "skills_match" => { "score" => 80, "matched_skills" => ["Ruby"], "missing_critical" => [], "transferable" => [] },
      "experience_relevance" => { "score" => 70, "role_alignment" => "moderate" },
      "education_fit" => { "score" => 60 },
      "format_quality" => { "score" => 70, "issues" => [] },
      "content_quality" => { "score" => 65, "has_quantified_achievements" => false, "action_verb_usage" => "moderate", "issues" => [] },
      "overall_score" => 70.0
    }
  end

  before do
    stub_request(:post, "http://localhost:11434/api/chat")
      .to_return(
        status: 200,
        body: {
          message: { content: llm_response.to_json },
          model: "qwen2.5:3b",
          eval_count: 100,
          prompt_eval_count: 200
        }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  describe "#perform" do
    it "creates a completed ResumeScore" do
      expect {
        described_class.perform_now(resume.id, job_description.id)
      }.to change(ResumeScore, :count).by(1)

      score = ResumeScore.last
      expect(score.status).to eq("completed")
      expect(score.overall_score).to be > 0
    end

    it "updates an existing queued score instead of creating a duplicate" do
      queued = create(:resume_score, :queued, organization: organization, user: user,
        resume: resume, job_description: job_description)

      expect {
        described_class.perform_now(resume.id, job_description.id, score_id: queued.id, user_id: user.id)
      }.not_to change(ResumeScore, :count)

      queued.reload
      expect(queued.status).to eq("completed")
      expect(queued.overall_score).to be > 0
    end

    it "re-enqueues when resume is not ready yet" do
      empty_resume = create(:resume, user: user, organization: organization, raw_text: nil, status: :pending)
      queued = create(:resume_score, :queued, organization: organization, user: user,
        resume: empty_resume, job_description: job_description)

      expect {
        described_class.perform_now(empty_resume.id, job_description.id, score_id: queued.id, user_id: user.id)
      }.to have_enqueued_job(described_class)

      expect(queued.reload.status).to eq("queued")
    end

    it "marks score as error when resume processing has failed" do
      failed_resume = create(:resume, :with_error, user: user, organization: organization)
      queued = create(:resume_score, :queued, organization: organization, user: user,
        resume: failed_resume, job_description: job_description)

      expect {
        described_class.perform_now(failed_resume.id, job_description.id, score_id: queued.id, user_id: user.id)
      }.not_to have_enqueued_job(described_class)

      queued.reload
      expect(queued.status).to eq("error")
      expect(queued.error_message).to be_present
    end

    it "handles duplicate scores gracefully" do
      described_class.perform_now(resume.id, job_description.id)

      # Second call should hit cache, not raise
      expect {
        described_class.perform_now(resume.id, job_description.id)
      }.not_to change(ResumeScore, :count)
    end

    it "handles missing resume" do
      expect { described_class.perform_now(-1, job_description.id) }.not_to raise_error
    end

    it "handles missing job description" do
      expect { described_class.perform_now(resume.id, -1) }.not_to raise_error
    end
  end

  describe "job configuration" do
    it "is enqueued in the default queue" do
      expect(described_class.new.queue_name).to eq("default")
    end
  end
end
