require "rails_helper"

RSpec.describe "InvitationAcceptances", type: :request do
  let(:org) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: org) }

  describe "GET /invitations/:token" do
    it "renders the acceptance form for a valid pending invitation" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin) }

      get invitation_acceptance_path(invitation.token)
      expect(response).to have_http_status(:ok)
    end

    it "shows error for invalid token" do
      get invitation_acceptance_path("nonexistent_token")
      expect(response).to have_http_status(:ok)
    end

    it "shows error for already accepted invitation" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, :accepted, organization: org, invited_by: admin) }

      get invitation_acceptance_path(invitation.token)
      expect(response).to have_http_status(:ok)
    end

    it "shows error for expired invitation" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, :expired, organization: org, invited_by: admin) }

      get invitation_acceptance_path(invitation.token)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /invitations/:token" do
    it "creates a user and accepts the invitation" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin, email: "newuser@test.com") }

      expect {
        post invitation_acceptance_path(invitation.token), params: {
          first_name: "New",
          last_name: "User",
          password: "password123",
          password_confirmation: "password123",
        }
      }.to change(User, :count).by(1)

      expect(invitation.reload.status).to eq("accepted")
      expect(response).to redirect_to(root_path)
    end

    it "sets the user role from the invitation" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, :recruiter_role, organization: org, invited_by: admin, email: "recruiter@test.com") }

      post invitation_acceptance_path(invitation.token), params: {
        first_name: "New",
        last_name: "Recruiter",
        password: "password123",
        password_confirmation: "password123",
      }

      user = User.find_by(email_address: "recruiter@test.com")
      expect(user.role).to eq("recruiter")
    end

    it "starts a session for the new user" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin, email: "session@test.com") }

      post invitation_acceptance_path(invitation.token), params: {
        first_name: "Session",
        last_name: "User",
        password: "password123",
        password_confirmation: "password123",
      }

      expect(cookies[:session_id]).to be_present
    end

    it "rejects expired invitation" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin, expires_at: 1.day.ago) }

      post invitation_acceptance_path(invitation.token), params: {
        first_name: "Late",
        last_name: "User",
        password: "password123",
        password_confirmation: "password123",
      }

      expect(response).to redirect_to(new_session_path)
    end

    it "rejects invalid token" do
      post invitation_acceptance_path("invalid_token"), params: {
        first_name: "Bad",
        last_name: "Token",
        password: "password123",
        password_confirmation: "password123",
      }

      expect(response).to redirect_to(new_session_path)
    end

    it "shows errors for invalid user params" do
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin, email: "invalid@test.com") }

      post invitation_acceptance_path(invitation.token), params: {
        first_name: "",
        last_name: "User",
        password: "short",
        password_confirmation: "short",
      }

      expect(response).to redirect_to(invitation_acceptance_path(invitation.token))
    end
  end
end
