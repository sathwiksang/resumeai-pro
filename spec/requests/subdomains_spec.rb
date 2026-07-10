require "rails_helper"

RSpec.describe "Subdomains", type: :request do
  let(:workspace_domain) { Rails.application.config.x.workspace_domain }
  let!(:organization) { create(:organization, subdomain: "acme") }

  describe "GET /subdomains/check (Caddy on-demand TLS ask)" do
    it "returns 200 for an existing organization's workspace host" do
      get "/subdomains/check", params: { domain: "acme.#{workspace_domain}" }
      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for an unknown subdomain" do
      get "/subdomains/check", params: { domain: "nope.#{workspace_domain}" }
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for hosts outside the workspace domain" do
      get "/subdomains/check", params: { domain: "acme.evil.example.com" }
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 without a domain param" do
      get "/subdomains/check"
      expect(response).to have_http_status(:not_found)
    end

    it "requires no authentication" do
      get "/subdomains/check", params: { domain: "acme.#{workspace_domain}" }
      expect(response).not_to redirect_to(new_session_path)
    end
  end

  describe "workspace host mismatch guard" do
    let(:user) { create(:user, :admin, organization: organization) }

    # The session cookie is host-scoped, so sign in on the host under test.
    def sign_in_on(host)
      host!(host)
      post session_path, params: { email_address: user.email_address, password: user.password }
    end

    it "redirects a signed-in user visiting another org's workspace to their own" do
      sign_in_on "otherorg.#{workspace_domain}"
      get dashboard_path
      expect(response).to redirect_to("http://acme.#{workspace_domain}/dashboard")
    end

    it "serves the user's own workspace host normally" do
      sign_in_on "acme.#{workspace_domain}"
      get dashboard_path
      expect(response).to have_http_status(:ok)
    end

    it "leaves the apex host untouched" do
      sign_in_on workspace_domain
      get dashboard_path
      expect(response).to have_http_status(:ok)
    end
  end
end
