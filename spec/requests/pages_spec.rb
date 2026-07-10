require "rails_helper"

RSpec.describe "Pages", type: :request do
  describe "GET /welcome" do
    it "renders landing page for unauthenticated visitors" do
      get landing_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects authenticated users to dashboard" do
      org = create(:organization)
      user = create(:user, organization: org)
      sign_in(user)
      get landing_path
      expect(response).to redirect_to(dashboard_path)
    end
  end
end
