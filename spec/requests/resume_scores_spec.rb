require "rails_helper"

RSpec.describe "ResumeScores", type: :request do
  let(:org) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: org) }
  let(:user) { create(:user, organization: org) }
  let(:resume) { create(:resume, organization: org, user: user) }
  let(:jd) { create(:job_description, organization: org, user: user) }

  before { sign_in(user) }

  # === INDEX ===
  describe "GET /resume_scores" do
    it "returns success" do
      get resume_scores_path
      expect(response).to have_http_status(:ok)
    end

    it "returns success when scores exist" do
      create(:resume_score, organization: org, user: user, resume: resume, job_description: jd)
      get resume_scores_path
      expect(response).to have_http_status(:ok)
    end

    it "filters by status" do
      create(:resume_score, organization: org, user: user, resume: resume, job_description: jd, status: :completed)
      get resume_scores_path(status: "completed")
      expect(response).to have_http_status(:ok)
    end

    it "filters by grade" do
      create(:resume_score, organization: org, user: user, resume: resume,
             job_description: jd, overall_score: 92, status: :completed)
      get resume_scores_path(grade: "A+")
      expect(response).to have_http_status(:ok)
    end

    it "handles invalid grade filter gracefully" do
      get resume_scores_path(grade: "Z")
      expect(response).to have_http_status(:ok)
    end
  end

  # === SHOW ===
  describe "GET /resume_scores/:id" do
    it "returns success for completed score" do
      score = create(:resume_score, organization: org, user: user, resume: resume,
                     job_description: jd, status: :completed, overall_score: 85.0)
      get resume_score_path(score)
      expect(response).to have_http_status(:ok)
    end

    it "returns success for queued score" do
      score = create(:resume_score, :queued, organization: org, user: user,
                     resume: resume, job_description: jd)
      get resume_score_path(score)
      expect(response).to have_http_status(:ok)
    end

    it "returns success for error score" do
      score = create(:resume_score, organization: org, user: user, resume: resume,
                     job_description: jd, status: :error, error_message: "Test error")
      get resume_score_path(score)
      expect(response).to have_http_status(:ok)
    end
  end

  # === CREATE ===
  describe "POST /resume_scores" do
    it "creates a score and queues ScoringJob" do
      expect {
        post resume_scores_path, params: {
          resume_id: resume.id,
          job_description_id: jd.id,
        }
      }.to change(ResumeScore, :count).by(1)
        .and have_enqueued_job(ScoringJob)

      expect(response).to have_http_status(:redirect)
    end

    it "redirects to score show page" do
      post resume_scores_path, params: {
        resume_id: resume.id,
        job_description_id: jd.id,
      }
      score = ResumeScore.last
      expect(response).to redirect_to(resume_score_path(score))
    end

    it "sets status to queued" do
      post resume_scores_path, params: {
        resume_id: resume.id,
        job_description_id: jd.id,
      }
      expect(ResumeScore.last.status).to eq("queued")
    end
  end

  # === DESTROY (requires admin) ===
  describe "DELETE /resume_scores/:id" do
    before { sign_in(admin) }

    it "deletes the score" do
      score = create(:resume_score, organization: org, user: user, resume: resume, job_description: jd)
      expect {
        delete resume_score_path(score)
      }.to change(ResumeScore, :count).by(-1)
    end

    it "redirects to index" do
      score = create(:resume_score, organization: org, user: user, resume: resume, job_description: jd)
      delete resume_score_path(score)
      expect(response).to redirect_to(resume_scores_path)
    end

    context "when non-admin attempts delete" do
      before { sign_in(user) }

      it "denies the action" do
        score = create(:resume_score, organization: org, user: user, resume: resume, job_description: jd)
        delete resume_score_path(score)
        # Pundit redirects unauthorized users
        expect(response).to have_http_status(:redirect)
      end
    end
  end

  # === AUTHORIZATION ===
  describe "authorization" do
    it "redirects unauthenticated users" do
      # Reset cookies to simulate logged out state
      reset!
      get resume_scores_path
      expect(response).to redirect_to(new_session_path)
    end
  end
end
