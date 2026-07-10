class StripeService
  PLAN_PRICES = {
    "pro" => ENV.fetch("STRIPE_PRO_PRICE_ID", "price_pro_monthly"),
    "enterprise" => ENV.fetch("STRIPE_ENTERPRISE_PRICE_ID", "price_enterprise_monthly")
  }.freeze

  class << self
    def create_checkout_session(organization:, plan:, success_url:, cancel_url:)
      customer = ensure_customer!(organization)
      price_id = PLAN_PRICES.fetch(plan)

      Stripe::Checkout::Session.create(
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [{ price: price_id, quantity: 1 }],
        mode: "subscription",
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: { organization_id: organization.id, plan: plan }
      )
    end

    def create_portal_session(organization:, return_url:)
      Stripe::BillingPortal::Session.create(
        customer: organization.stripe_customer_id,
        return_url: return_url
      )
    end

    def cancel_subscription(organization)
      return unless organization.stripe_subscription_id

      Stripe::Subscription.cancel(organization.stripe_subscription_id)
      organization.update!(
        subscription_status: "canceled",
        stripe_subscription_id: nil
      )
    end

    def ensure_customer!(organization)
      if organization.stripe_customer_id.present?
        Stripe::Customer.retrieve(organization.stripe_customer_id)
      else
        customer = Stripe::Customer.create(
          name: organization.name,
          email: organization.billing_email || organization.users.find_by(role: :admin)&.email_address,
          metadata: { organization_id: organization.id }
        )
        organization.update!(stripe_customer_id: customer.id)
        customer
      end
    end

    # Webhook handlers

    def handle_checkout_completed(event)
      session = event.data.object
      org_id = session.metadata["organization_id"]
      plan = session.metadata["plan"]
      organization = Organization.find(org_id)

      subscription = Stripe::Subscription.retrieve(session.subscription)

      organization.update!(
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        current_period_end: Time.at(subscription.current_period_end),
        plan: plan
      )
      organization.upgrade_plan!(plan)
    end

    def handle_subscription_updated(event)
      subscription = event.data.object
      organization = Organization.find_by(stripe_subscription_id: subscription.id)
      return unless organization

      organization.update!(
        subscription_status: subscription.status,
        current_period_end: Time.at(subscription.current_period_end)
      )
    end

    def handle_subscription_deleted(event)
      subscription = event.data.object
      organization = Organization.find_by(stripe_subscription_id: subscription.id)
      return unless organization

      organization.update!(
        subscription_status: "canceled",
        stripe_subscription_id: nil
      )
      organization.upgrade_plan!("free")
    end

    def handle_invoice_payment_failed(event)
      invoice = event.data.object
      organization = Organization.find_by(stripe_customer_id: invoice.customer)
      return unless organization

      organization.update!(subscription_status: "past_due")
    end
  end
end
