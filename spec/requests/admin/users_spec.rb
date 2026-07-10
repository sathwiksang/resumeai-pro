require "rails_helper"

RSpec.describe "Admin::Users", type: :request do
  let(:organization) { create(:organization) }
  let(:admin) { create(:user, :admin, organization: organization) }

  before { sign_in(admin) }

  describe "GET /admin/users" do
    it "lists users for admin" do
      create(:user, organization: organization)
      get admin_users_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects non-admin users" do
      candidate = create(:user, organization: organization, role: :candidate)
      sign_in(candidate)
      get admin_users_path
      expect(response).to redirect_to(root_path)
    end
  end

  describe "GET /admin/users/new" do
    it "renders new user form" do
      get new_admin_user_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /admin/users/:id" do
    it "shows a user" do
      user = create(:user, organization: organization)
      get admin_user_path(user)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /admin/users" do
    it "creates a new user" do
      expect {
        post admin_users_path, params: {
          user: {
            first_name: "New",
            last_name: "User",
            email_address: "new@example.com",
            role: "candidate",
            password: "password123",
            password_confirmation: "password123",
          },
        }
      }.to change(User, :count).by(1)
      expect(response).to redirect_to(admin_users_path)
    end

    it "redirects back on invalid data" do
      post admin_users_path, params: { user: { email_address: "" } }
      expect(response).to redirect_to(new_admin_user_path)
    end
  end

  describe "GET /admin/users/:id/edit" do
    it "renders edit form" do
      user = create(:user, organization: organization)
      get edit_admin_user_path(user)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /admin/users/:id" do
    it "updates a user" do
      user = create(:user, organization: organization)
      patch admin_user_path(user), params: { user: { first_name: "Updated" } }
      expect(response).to redirect_to(admin_users_path)
      expect(user.reload.first_name).to eq("Updated")
    end
  end

  describe "DELETE /admin/users/:id" do
    it "deletes another user" do
      user = create(:user, organization: organization)
      expect {
        delete admin_user_path(user)
      }.to change(User, :count).by(-1)
      expect(response).to redirect_to(admin_users_path)
    end

    it "prevents deleting yourself" do
      delete admin_user_path(admin)
      expect(response).to redirect_to(root_path)
      expect(User.exists?(admin.id)).to be true
    end
  end
end
