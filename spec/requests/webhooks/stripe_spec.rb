require "rails_helper"

RSpec.describe "Webhooks::Stripe", type: :request do
  let(:webhook_secret) { "whsec_test_secret" }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("STRIPE_WEBHOOK_SECRET", anything).and_return(webhook_secret)
  end

  def generate_signature(payload)
    timestamp = Time.now.to_i
    signed_payload = "#{timestamp}.#{payload}"
    signature = OpenSSL::HMAC.hexdigest("SHA256", webhook_secret, signed_payload)
    "t=#{timestamp},v1=#{signature}"
  end

  describe "POST /webhooks/stripe" do
    let(:event_payload) do
      {
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: {
          object: {
            metadata: { organization_id: "1", plan: "pro" },
            subscription: "sub_test"
          }
        }
      }.to_json
    end

    it "returns 200 for valid webhook" do
      signature = generate_signature(event_payload)

      post webhooks_stripe_path,
        params: event_payload,
        headers: {
          "HTTP_STRIPE_SIGNATURE" => signature,
          "CONTENT_TYPE" => "application/json",
        }

      expect(response).to have_http_status(:ok)
    end

    it "returns 400 for invalid signature" do
      post webhooks_stripe_path,
        params: event_payload,
        headers: {
          "HTTP_STRIPE_SIGNATURE" => "t=123,v1=invalid",
          "CONTENT_TYPE" => "application/json",
        }

      expect(response).to have_http_status(:bad_request)
    end

    it "returns 400 for invalid JSON" do
      bad_payload = "not json"
      signature = generate_signature(bad_payload)

      post webhooks_stripe_path,
        params: bad_payload,
        headers: {
          "HTTP_STRIPE_SIGNATURE" => signature,
          "CONTENT_TYPE" => "application/json",
        }

      expect(response).to have_http_status(:bad_request)
    end

    it "enqueues a StripeWebhookJob for valid events" do
      signature = generate_signature(event_payload)

      expect {
        post webhooks_stripe_path,
          params: event_payload,
          headers: {
            "HTTP_STRIPE_SIGNATURE" => signature,
            "CONTENT_TYPE" => "application/json",
          }
      }.to have_enqueued_job(StripeWebhookJob)
    end

    it "returns 200 for duplicate events (idempotency)" do
      org = create(:organization)
      create(:billing_event, organization: org, stripe_event_id: "evt_test_123")

      signature = generate_signature(event_payload)

      post webhooks_stripe_path,
        params: event_payload,
        headers: {
          "HTTP_STRIPE_SIGNATURE" => signature,
          "CONTENT_TYPE" => "application/json",
        }

      expect(response).to have_http_status(:ok)
    end

    it "does not require authentication" do
      signature = generate_signature(event_payload)

      post webhooks_stripe_path,
        params: event_payload,
        headers: {
          "HTTP_STRIPE_SIGNATURE" => signature,
          "CONTENT_TYPE" => "application/json",
        }

      # Should not redirect to login
      expect(response).not_to have_http_status(:redirect)
    end
  end
end
