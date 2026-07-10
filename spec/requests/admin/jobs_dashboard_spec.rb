require "rails_helper"

# Mission Control jobs dashboard is mounted behind AdminSessionConstraint.
RSpec.describe "Admin::Jobs dashboard (/admin/jobs)", type: :request do
  let(:organization) { create(:organization) }

  it "is not routable for anonymous visitors" do
    get "/admin/jobs"
    expect(response).to have_http_status(:not_found)
  end

  it "is not routable for a signed-in non-admin" do
    sign_in(create(:user, organization: organization, role: :candidate))
    get "/admin/jobs"
    expect(response).to have_http_status(:not_found)
  end

  it "is reachable for a signed-in admin" do
    sign_in(create(:user, :admin, organization: organization))
    get "/admin/jobs"
    # Mission Control redirects /admin/jobs to its default tab; any non-404,
    # non-error response proves the constraint admitted the request.
    expect(response.status).to be < 400
  end
end
