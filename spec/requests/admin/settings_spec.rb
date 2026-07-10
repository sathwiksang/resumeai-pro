require "rails_helper"

RSpec.describe "Admin::Settings", type: :request do
  let(:organization) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: organization, password: "oldpassword") }

  before { sign_in(admin) }

  describe "GET /admin/settings" do
    it "renders settings page" do
      get admin_settings_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects non-admin users" do
      candidate = create(:user, organization: organization, role: :candidate)
      sign_in(candidate)
      get admin_settings_path
      expect(response).to redirect_to(root_path)
    end
  end

  describe "PATCH /admin/settings" do
    it "updates organization settings" do
      patch admin_settings_path, params: { section: "organization", organization: { name: "New Name" } }
      expect(response).to redirect_to(admin_settings_path)
      expect(organization.reload.name).to eq("New Name")
    end

    it "updates profile settings" do
      patch admin_settings_path, params: { section: "profile", user: { first_name: "Updated" } }
      expect(response).to redirect_to(admin_settings_path)
      expect(admin.reload.first_name).to eq("Updated")
    end

    it "updates password with the correct current password" do
      patch admin_settings_path, params: {
        section: "password",
        user: { current_password: "oldpassword", password: "newpassword123", password_confirmation: "newpassword123" },
      }
      expect(response).to redirect_to(admin_settings_path)
      expect(admin.reload.authenticate("newpassword123")).to be_truthy
    end

    it "rejects a password change with the wrong current password" do
      patch admin_settings_path, params: {
        section: "password",
        user: { current_password: "wrongpassword", password: "newpassword123", password_confirmation: "newpassword123" },
      }
      expect(response).to redirect_to(admin_settings_path)
      expect(admin.reload.authenticate("newpassword123")).to be_falsey
      expect(admin.authenticate("oldpassword")).to be_truthy
    end

    it "rejects a password change with a blank current password" do
      patch admin_settings_path, params: {
        section: "password",
        user: { current_password: "", password: "newpassword123", password_confirmation: "newpassword123" },
      }
      expect(admin.reload.authenticate("oldpassword")).to be_truthy
    end

    it "handles unknown section" do
      patch admin_settings_path, params: { section: "unknown" }
      expect(response).to redirect_to(admin_settings_path)
    end
  end
end
