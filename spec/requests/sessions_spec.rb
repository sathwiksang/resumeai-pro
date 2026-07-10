require "rails_helper"

RSpec.describe "Sessions", type: :request do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, organization: organization, password: "password123") }

  describe "GET /session/new" do
    it "renders login page for unauthenticated users" do
      get new_session_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects authenticated users to dashboard" do
      sign_in(user)
      get new_session_path
      expect(response).to redirect_to(dashboard_path)
    end
  end

  describe "POST /session" do
    it "authenticates with valid credentials" do
      post session_path, params: { email_address: user.email_address, password: "password123" }
      expect(response).to redirect_to(root_path)
    end

    it "rejects invalid credentials" do
      post session_path, params: { email_address: user.email_address, password: "wrong" }
      expect(response).to redirect_to(new_session_path)
    end

    it "rejects non-existent email" do
      post session_path, params: { email_address: "nobody@example.com", password: "password123" }
      expect(response).to redirect_to(new_session_path)
    end
  end

  describe "DELETE /session" do
    it "logs the user out and shows a confirmation on the login page" do
      sign_in(user)
      delete session_path
      expect(response).to redirect_to(new_session_path)
      expect(flash[:notice]).to eq("You have been logged out.")
    end
  end
end
