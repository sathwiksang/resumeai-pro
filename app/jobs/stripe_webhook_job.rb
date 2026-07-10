class StripeWebhookJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 5

  EVENT_HANDLERS = {
    "checkout.session.completed" => :handle_checkout_completed,
    "customer.subscription.updated" => :handle_subscription_updated,
    "customer.subscription.deleted" => :handle_subscription_deleted,
    "invoice.payment_failed" => :handle_invoice_payment_failed
  }.freeze

  def perform(event_data)
    event_type = event_data["type"]
    handler = EVENT_HANDLERS[event_type]
    return unless handler

    event = Stripe::Event.construct_from(event_data.deep_symbolize_keys)

    StripeService.public_send(handler, event)
  end
end
