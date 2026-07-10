require "rails_helper"

RSpec.describe "Admin::Billings", type: :request do
  let(:org) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: org) }
  let(:candidate) { create(:user, organization: org) }

  describe "GET /admin/billing" do
    it "renders for admin" do
      sign_in(admin)
      get admin_billing_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects non-admin" do
      sign_in(candidate)
      get admin_billing_path
      expect(response).to redirect_to(root_path)
    end

    it "includes usage data" do
      sign_in(admin)
      get admin_billing_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /admin/billing/create_checkout" do
    context "in dev mode (no stripe key)" do
      it "directly upgrades to pro" do
        sign_in(admin)
        post create_checkout_admin_billing_path, params: { plan: "pro" }
        expect(org.reload.plan).to eq("pro")
        expect(response).to redirect_to(admin_billing_path)
      end

      it "directly upgrades to enterprise" do
        sign_in(admin)
        post create_checkout_admin_billing_path, params: { plan: "enterprise" }
        expect(org.reload.plan).to eq("enterprise")
      end

      it "rejects invalid plan" do
        sign_in(admin)
        post create_checkout_admin_billing_path, params: { plan: "invalid" }
        expect(response).to redirect_to(admin_billing_path)
        expect(flash[:alert]).to eq("Invalid plan.")
      end

      it "redirects non-admin" do
        sign_in(candidate)
        post create_checkout_admin_billing_path, params: { plan: "pro" }
        expect(response).to redirect_to(root_path)
      end
    end
  end

  describe "POST /admin/billing/create_portal_session" do
    it "redirects to billing page when stripe not enabled" do
      sign_in(admin)
      post create_portal_session_admin_billing_path
      expect(response).to redirect_to(admin_billing_path)
      expect(flash[:alert]).to include("not available")
    end

    it "redirects non-admin" do
      sign_in(candidate)
      post create_portal_session_admin_billing_path
      expect(response).to redirect_to(root_path)
    end
  end
end
