require "rails_helper"

RSpec.describe "Registrations", type: :request do
  describe "GET /registration/new" do
    it "renders registration page for unauthenticated users" do
      get new_registration_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects authenticated users to dashboard" do
      org = create(:organization)
      user = create(:user, organization: org)
      sign_in(user)
      get new_registration_path
      expect(response).to redirect_to(dashboard_path)
    end
  end

  describe "POST /registration" do
    let(:valid_params) do
      {
        organization: { name: "Acme Corp", subdomain: "acme" },
        user: {
          first_name: "Jane",
          last_name: "Doe",
          email_address: "jane@acme.com",
          password: "securepass123",
          password_confirmation: "securepass123",
        },
      }
    end

    it "creates organization and user" do
      expect {
        post registration_path, params: valid_params
      }.to change(Organization, :count).by(1)
        .and change(User, :count).by(1)
    end

    it "redirects to dashboard on success" do
      post registration_path, params: valid_params
      expect(response).to redirect_to(dashboard_path)
    end

    it "assigns admin role to the first user" do
      post registration_path, params: valid_params
      expect(User.last.role).to eq("admin")
    end

    it "redirects back with errors on invalid data" do
      post registration_path, params: {
        organization: { name: "" },
        user: { email_address: "", password: "" },
      }
      expect(response).to redirect_to(new_registration_path)
    end
  end
end
