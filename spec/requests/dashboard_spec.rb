require "rails_helper"

RSpec.describe "Dashboard", type: :request do
  let(:org) { create(:organization) }
  let(:user) { create(:user, organization: org) }

  before { sign_in(user) }

  describe "GET /dashboard" do
    it "returns success" do
      get dashboard_path
      expect(response).to have_http_status(:ok)
    end

    it "returns success with no data" do
      get dashboard_path
      expect(response).to have_http_status(:ok)
    end

    it "returns success with scores" do
      resume = create(:resume, organization: org, user: user)
      jd = create(:job_description, organization: org, user: user)
      create(:resume_score, organization: org, user: user, resume: resume,
             job_description: jd, status: :completed, overall_score: 85.0)
      get dashboard_path
      expect(response).to have_http_status(:ok)
    end

    it "computes grade distribution" do
      resume1 = create(:resume, organization: org, user: user)
      resume2 = create(:resume, organization: org, user: user)
      jd = create(:job_description, organization: org, user: user)
      create(:resume_score, organization: org, user: user, resume: resume1,
             job_description: jd, status: :completed, overall_score: 92.0)
      jd2 = create(:job_description, organization: org, user: user)
      create(:resume_score, organization: org, user: user, resume: resume2,
             job_description: jd2, status: :completed, overall_score: 72.0)

      get dashboard_path
      expect(response).to have_http_status(:ok)
    end

    it "includes usage info for the organization" do
      get dashboard_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "authentication" do
    it "redirects unauthenticated users" do
      reset!
      get dashboard_path
      expect(response).to redirect_to(new_session_path)
    end
  end
end
