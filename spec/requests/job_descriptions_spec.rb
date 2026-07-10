require "rails_helper"

RSpec.describe "JobDescriptions", type: :request do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, :recruiter, organization: organization) }

  before { sign_in(user) }

  describe "GET /job_descriptions" do
    it "lists job descriptions" do
      create(:job_description, user: user, organization: organization)
      get job_descriptions_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /job_descriptions/new" do
    it "renders new form" do
      get new_job_description_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /job_descriptions/:id" do
    it "shows a job description" do
      jd = create(:job_description, user: user, organization: organization)
      get job_description_path(jd)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /job_descriptions" do
    it "creates a job description" do
      expect {
        post job_descriptions_path, params: {
          job_description: { title: "Ruby Dev", company: "Acme", description: "Build stuff" },
        }
      }.to change(JobDescription, :count).by(1)
      expect(response).to redirect_to(job_description_path(JobDescription.last))
    end

    it "redirects back on invalid data" do
      post job_descriptions_path, params: { job_description: { title: "" } }
      expect(response).to redirect_to(new_job_description_path)
    end
  end

  describe "GET /job_descriptions/:id/edit" do
    it "renders edit form" do
      jd = create(:job_description, user: user, organization: organization)
      get edit_job_description_path(jd)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /job_descriptions/:id" do
    it "updates a job description" do
      jd = create(:job_description, user: user, organization: organization)
      patch job_description_path(jd), params: { job_description: { title: "Updated Title" } }
      expect(response).to redirect_to(job_description_path(jd))
      expect(jd.reload.title).to eq("Updated Title")
    end
  end

  describe "DELETE /job_descriptions/:id" do
    it "deletes a job description" do
      jd = create(:job_description, user: user, organization: organization)
      expect {
        delete job_description_path(jd)
      }.to change(JobDescription, :count).by(-1)
      expect(response).to redirect_to(job_descriptions_path)
    end
  end
end
