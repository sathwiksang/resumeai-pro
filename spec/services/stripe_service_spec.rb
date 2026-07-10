require "rails_helper"

RSpec.describe StripeService do
  let(:org) { create(:organization, :with_stripe, plan: "free") }

  describe ".ensure_customer!" do
    context "when organization has a stripe_customer_id" do
      it "retrieves the existing customer" do
        customer_double = double("Stripe::Customer", id: org.stripe_customer_id)
        allow(Stripe::Customer).to receive(:retrieve).with(org.stripe_customer_id).and_return(customer_double)

        result = described_class.ensure_customer!(org)
        expect(result.id).to eq(org.stripe_customer_id)
      end
    end

    context "when organization has no stripe_customer_id" do
      let(:org) { create(:organization, stripe_customer_id: nil) }

      it "creates a new Stripe customer" do
        admin = create(:user, :admin, organization: org)
        customer_double = double("Stripe::Customer", id: "cus_new123")
        allow(Stripe::Customer).to receive(:create).and_return(customer_double)

        result = described_class.ensure_customer!(org)
        expect(result.id).to eq("cus_new123")
        expect(org.reload.stripe_customer_id).to eq("cus_new123")
      end
    end
  end

  describe ".create_checkout_session" do
    it "creates a Stripe checkout session" do
      customer_double = double("Stripe::Customer", id: org.stripe_customer_id)
      allow(Stripe::Customer).to receive(:retrieve).and_return(customer_double)

      session_double = double("Stripe::Checkout::Session", url: "https://checkout.stripe.com/test")
      allow(Stripe::Checkout::Session).to receive(:create).and_return(session_double)

      result = described_class.create_checkout_session(
        organization: org,
        plan: "pro",
        success_url: "http://test.com/success",
        cancel_url: "http://test.com/cancel"
      )

      expect(result.url).to eq("https://checkout.stripe.com/test")
    end
  end

  describe ".create_portal_session" do
    it "creates a Stripe billing portal session" do
      session_double = double("Stripe::BillingPortal::Session", url: "https://billing.stripe.com/test")
      allow(Stripe::BillingPortal::Session).to receive(:create).and_return(session_double)

      result = described_class.create_portal_session(
        organization: org,
        return_url: "http://test.com/billing"
      )

      expect(result.url).to eq("https://billing.stripe.com/test")
    end
  end

  describe ".cancel_subscription" do
    it "cancels the subscription and updates the organization" do
      allow(Stripe::Subscription).to receive(:cancel).with(org.stripe_subscription_id)

      described_class.cancel_subscription(org)

      org.reload
      expect(org.subscription_status).to eq("canceled")
      expect(org.stripe_subscription_id).to be_nil
    end
  end

  describe ".handle_checkout_completed" do
    it "updates organization plan and subscription" do
      event_data = {
        type: "checkout.session.completed",
        data: {
          object: {
            metadata: { "organization_id" => org.id.to_s, "plan" => "pro" },
            subscription: "sub_new123"
          }
        }
      }
      event = Stripe::Event.construct_from(event_data)

      subscription_double = double("Stripe::Subscription",
        id: "sub_new123",
        status: "active",
        current_period_end: 30.days.from_now.to_i
      )
      allow(Stripe::Subscription).to receive(:retrieve).with("sub_new123").and_return(subscription_double)

      described_class.handle_checkout_completed(event)

      org.reload
      expect(org.plan).to eq("pro")
      expect(org.stripe_subscription_id).to eq("sub_new123")
      expect(org.subscription_status).to eq("active")
    end
  end

  describe ".handle_subscription_updated" do
    it "updates subscription status" do
      event_data = {
        type: "customer.subscription.updated",
        data: {
          object: {
            id: org.stripe_subscription_id,
            status: "past_due",
            current_period_end: 15.days.from_now.to_i
          }
        }
      }
      event = Stripe::Event.construct_from(event_data)

      described_class.handle_subscription_updated(event)

      expect(org.reload.subscription_status).to eq("past_due")
    end

    it "does nothing if organization not found" do
      event_data = {
        type: "customer.subscription.updated",
        data: {
          object: { id: "sub_unknown", status: "active", current_period_end: 30.days.from_now.to_i }
        }
      }
      event = Stripe::Event.construct_from(event_data)

      expect { described_class.handle_subscription_updated(event) }.not_to raise_error
    end
  end

  describe ".handle_subscription_deleted" do
    it "downgrades to free plan" do
      org.update!(plan: "pro", monthly_analysis_limit: 200)

      event_data = {
        type: "customer.subscription.deleted",
        data: {
          object: { id: org.stripe_subscription_id, status: "canceled", current_period_end: Time.now.to_i }
        }
      }
      event = Stripe::Event.construct_from(event_data)

      described_class.handle_subscription_deleted(event)

      org.reload
      expect(org.plan).to eq("free")
      expect(org.subscription_status).to eq("canceled")
      expect(org.stripe_subscription_id).to be_nil
    end
  end

  describe ".handle_invoice_payment_failed" do
    it "marks organization as past_due" do
      event_data = {
        type: "invoice.payment_failed",
        data: {
          object: { customer: org.stripe_customer_id }
        }
      }
      event = Stripe::Event.construct_from(event_data)

      described_class.handle_invoice_payment_failed(event)

      expect(org.reload.subscription_status).to eq("past_due")
    end
  end
end
