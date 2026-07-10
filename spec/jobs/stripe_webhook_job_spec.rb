require "rails_helper"

RSpec.describe StripeWebhookJob, type: :job do
  let(:org) { create(:organization, :with_stripe) }

  describe "#perform" do
    it "routes checkout.session.completed to handler" do
      event_data = {
        "type" => "checkout.session.completed",
        "data" => {
          "object" => {
            "metadata" => { "organization_id" => org.id.to_s, "plan" => "pro" },
            "subscription" => "sub_test123"
          }
        }
      }

      expect(StripeService).to receive(:handle_checkout_completed)
      described_class.new.perform(event_data)
    end

    it "routes customer.subscription.updated to handler" do
      event_data = {
        "type" => "customer.subscription.updated",
        "data" => {
          "object" => {
            "id" => org.stripe_subscription_id,
            "status" => "active",
            "current_period_end" => 30.days.from_now.to_i
          }
        }
      }

      expect(StripeService).to receive(:handle_subscription_updated)
      described_class.new.perform(event_data)
    end

    it "routes customer.subscription.deleted to handler" do
      event_data = {
        "type" => "customer.subscription.deleted",
        "data" => {
          "object" => { "id" => org.stripe_subscription_id, "status" => "canceled", "current_period_end" => Time.now.to_i }
        }
      }

      expect(StripeService).to receive(:handle_subscription_deleted)
      described_class.new.perform(event_data)
    end

    it "routes invoice.payment_failed to handler" do
      event_data = {
        "type" => "invoice.payment_failed",
        "data" => {
          "object" => { "customer" => org.stripe_customer_id }
        }
      }

      expect(StripeService).to receive(:handle_invoice_payment_failed)
      described_class.new.perform(event_data)
    end

    it "ignores unknown event types" do
      event_data = { "type" => "some.unknown.event", "data" => { "object" => {} } }

      expect(StripeService).not_to receive(:handle_checkout_completed)
      expect { described_class.new.perform(event_data) }.not_to raise_error
    end

    it "is enqueued on the default queue" do
      expect(described_class.new.queue_name).to eq("default")
    end
  end
end
