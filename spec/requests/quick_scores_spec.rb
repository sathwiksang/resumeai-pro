require "rails_helper"

RSpec.describe "QuickScores", type: :request do
  let(:org) { create(:organization) }
  let(:user) { create(:user, organization: org) }

  before { sign_in(user) }

  describe "GET /quick-score" do
    it "returns success" do
      get "/quick-score"
      expect(response).to have_http_status(:ok)
    end

    it "returns success with existing job descriptions" do
      create(:job_description, organization: org, user: user, status: :ready)
      get "/quick-score"
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /quick-score" do
    let(:jd) { create(:job_description, organization: org, user: user, status: :ready) }

    it "creates a score with existing JD and queues ScoringJob" do
      file = fixture_file_upload("sample_resume.txt", "text/plain")
      expect {
        post quick_score_path, params: {
          document: file,
          job_description_id: jd.id,
        }
      }.to change(ResumeScore, :count).by(1)
        .and change(Resume, :count).by(1)
        .and have_enqueued_job(ScoringJob)
    end

    it "creates a score with inline JD text" do
      file = fixture_file_upload("sample_resume.txt", "text/plain")
      expect {
        post quick_score_path, params: {
          document: file,
          job_title: "Software Engineer",
          job_description_text: "We need a software engineer with 5 years of experience in Ruby on Rails.",
        }
      }.to change(ResumeScore, :count).by(1)
        .and change(JobDescription, :count).by(1)
    end

    it "redirects to score show page" do
      file = fixture_file_upload("sample_resume.txt", "text/plain")
      post quick_score_path, params: {
        document: file,
        job_description_id: jd.id,
      }
      score = ResumeScore.last
      expect(response).to redirect_to(resume_score_path(score))
    end
  end

  describe "authentication" do
    it "redirects unauthenticated users" do
      reset!
      get new_quick_score_path
      expect(response).to redirect_to(new_session_path)
    end
  end
end
