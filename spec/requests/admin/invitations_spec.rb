require "rails_helper"

RSpec.describe "Admin::Invitations", type: :request do
  let(:org) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: org) }
  let(:recruiter) { create(:user, :recruiter, organization: org) }
  let(:candidate) { create(:user, organization: org) }

  describe "GET /admin/invitations" do
    it "renders for admin" do
      sign_in(admin)
      get admin_invitations_path
      expect(response).to have_http_status(:ok)
    end

    it "renders for recruiter" do
      sign_in(recruiter)
      get admin_invitations_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects candidate" do
      sign_in(candidate)
      get admin_invitations_path
      expect(response).to redirect_to(root_path)
    end

    it "lists existing invitations" do
      sign_in(admin)
      ActsAsTenant.with_tenant(org) do
        create(:invitation, organization: org, invited_by: admin, email: "test@example.com")
      end
      get admin_invitations_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /admin/invitations" do
    it "creates an invitation as admin" do
      sign_in(admin)
      expect {
        post admin_invitations_path, params: { invitation: { email: "new@example.com", role: "candidate" } }
      }.to change(Invitation, :count).by(1)
      expect(response).to redirect_to(admin_invitations_path)
    end

    it "creates an invitation as recruiter" do
      sign_in(recruiter)
      expect {
        post admin_invitations_path, params: { invitation: { email: "new2@example.com", role: "candidate" } }
      }.to change(Invitation, :count).by(1)
    end

    it "rejects invalid email" do
      sign_in(admin)
      post admin_invitations_path, params: { invitation: { email: "bad-email", role: "candidate" } }
      expect(response).to redirect_to(admin_invitations_path)
      expect(flash[:alert]).to be_present
    end

    it "enforces member limit" do
      org.update!(users_count: 2) # at free limit of 2
      sign_in(admin)
      post admin_invitations_path, params: { invitation: { email: "over@limit.com", role: "candidate" } }
      expect(response).to redirect_to(admin_invitations_path)
      expect(flash[:alert]).to include("member limit")
    end

    it "enqueues invitation email" do
      sign_in(admin)
      expect {
        post admin_invitations_path, params: { invitation: { email: "deliver@example.com", role: "candidate" } }
      }.to have_enqueued_mail(InvitationMailer, :invite)
    end

    it "redirects candidate" do
      sign_in(candidate)
      post admin_invitations_path, params: { invitation: { email: "no@access.com", role: "candidate" } }
      expect(response).to redirect_to(root_path)
    end
  end

  describe "DELETE /admin/invitations/:id" do
    it "destroys a pending invitation as admin" do
      sign_in(admin)
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin) }

      expect {
        delete admin_invitation_path(invitation)
      }.to change(Invitation, :count).by(-1)
    end

    it "does not allow recruiter to destroy" do
      sign_in(recruiter)
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin) }

      delete admin_invitation_path(invitation)
      expect(response).to redirect_to(root_path)
    end
  end

  describe "POST /admin/invitations/:id/resend" do
    it "resends invitation email" do
      sign_in(admin)
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin) }

      expect {
        post resend_admin_invitation_path(invitation)
      }.to have_enqueued_mail(InvitationMailer, :invite)
      expect(response).to redirect_to(admin_invitations_path)
    end

    it "updates the expiry date" do
      sign_in(admin)
      invitation = ActsAsTenant.with_tenant(org) { create(:invitation, organization: org, invited_by: admin, expires_at: 1.day.from_now) }
      old_expiry = invitation.expires_at

      post resend_admin_invitation_path(invitation)

      expect(invitation.reload.expires_at).to be > old_expiry
    end
  end
end
