require "rails_helper"

RSpec.describe "Resumes", type: :request do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization) }

  before { sign_in(user) }

  describe "GET /resumes" do
    it "lists resumes" do
      create(:resume, user: user, organization: organization)
      get resumes_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /resumes/new" do
    it "renders new resume form" do
      get new_resume_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /resumes/:id" do
    it "shows a resume" do
      resume = create(:resume, user: user, organization: organization)
      get resume_path(resume)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /resumes" do
    it "creates a resume with a document" do
      file = fixture_file_upload(
        Rails.root.join("spec/fixtures/files/sample.pdf"),
        "application/pdf"
      )
      post resumes_path, params: { resume: { document: file, filename: "test.pdf" } }
      expect(response).to redirect_to(resume_path(Resume.last))
    end

    it "redirects back on invalid data" do
      post resumes_path, params: { resume: { filename: "" } }
      expect(response).to redirect_to(new_resume_path)
    end
  end

  describe "GET /resumes/:id/edit" do
    it "renders edit form" do
      resume = create(:resume, user: user, organization: organization)
      get edit_resume_path(resume)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /resumes/:id" do
    it "updates a resume" do
      resume = create(:resume, user: user, organization: organization)
      patch resume_path(resume), params: { resume: { filename: "updated.pdf" } }
      expect(response).to redirect_to(resume_path(resume))
      expect(resume.reload.filename).to eq("updated.pdf")
    end
  end

  describe "DELETE /resumes/:id" do
    it "deletes a resume" do
      resume = create(:resume, user: user, organization: organization)
      expect {
        delete resume_path(resume)
      }.to change(Resume, :count).by(-1)
      expect(response).to redirect_to(resumes_path)
    end
  end
end
