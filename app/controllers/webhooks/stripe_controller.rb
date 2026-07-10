module Webhooks
  class StripeController < ApplicationController
    allow_unauthenticated_access
    skip_forgery_protection

    def create
      payload = request.body.read
      sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
      endpoint_secret = ENV.fetch("STRIPE_WEBHOOK_SECRET", Rails.application.credentials.dig(:stripe, :webhook_secret))

      begin
        event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
      rescue JSON::ParserError
        head :bad_request
        return
      rescue Stripe::SignatureVerificationError
        head :bad_request
        return
      end

      # Idempotency check
      if BillingEvent.exists?(stripe_event_id: event.id)
        head :ok
        return
      end

      StripeWebhookJob.perform_later(event.to_hash.deep_stringify_keys)
      head :ok
    end

    private

    def skip_pundit?
      true
    end
  end
end
