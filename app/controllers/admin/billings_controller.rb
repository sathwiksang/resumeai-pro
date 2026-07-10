module Admin
  class BillingsController < ApplicationController
    before_action :require_admin

    def show
      render inertia: "Admin/Billing/Show", props: {
        organization: {
          id: current_organization.id,
          name: current_organization.name,
          plan: current_organization.plan,
          monthly_analysis_limit: current_organization.effective_analysis_limit,
          analyses_used_this_month: current_organization.analyses_used_this_month,
          subscription_status: current_organization.subscription_status,
          current_period_end: current_organization.current_period_end&.iso8601,
          usage: current_organization.usage_summary,
        },
        plans: [
          {
            name: "Free",
            key: "free",
            price: 0,
            analyses_per_month: 10,
            features: ["10 analyses/month", "Basic scoring", "2 team members", "Email support"],
          },
          {
            name: "Pro",
            key: "pro",
            price: 29,
            analyses_per_month: 200,
            features: ["200 analyses/month", "Advanced AI scoring", "5 team members", "Priority support", "Bulk analysis", "Compare resumes"],
          },
          {
            name: "Enterprise",
            key: "enterprise",
            price: 99,
            analyses_per_month: -1,
            features: ["Unlimited analyses", "Custom AI models", "Up to 25 team members", "Dedicated support", "API access", "Custom integrations", "SSO"],
          },
        ],
        billing_events: current_organization.billing_events.recent.limit(20).map { |e|
          {
            id: e.id,
            event_type: e.event_type,
            status: e.status,
            created_at: e.created_at.iso8601,
          }
        },
        stripe_enabled: current_organization.stripe_enabled?,
      }
    end

    def create_checkout
      plan = params[:plan]

      unless %w[free pro enterprise].include?(plan)
        redirect_to admin_billing_path, alert: "Invalid plan."
        return
      end

      # Downgrading to Free never requires payment, so always allow it.
      if plan == "free"
        current_organization.upgrade_plan!("free")
        redirect_to admin_billing_path, notice: "Your plan has been changed to Free."
        return
      end

      if current_organization.stripe_enabled?
        session = StripeService.create_checkout_session(
          organization: current_organization,
          plan: plan,
          success_url: admin_billing_url,
          cancel_url: admin_billing_url,
        )
        redirect_to session.url, allow_other_host: true
      elsif demo_billing_enabled?
        # Demo mode only: switch plan without payment. Never on by default —
        # otherwise any admin could grant their org a free Enterprise plan.
        current_organization.upgrade_plan!(plan)
        redirect_to admin_billing_path, notice: "Plan updated to #{plan} (demo mode — no payment taken)."
      else
        redirect_to admin_billing_path,
          alert: "Billing is not enabled in this environment, so plans can't be changed."
      end
    end

    def create_portal_session
      unless current_organization.stripe_enabled? && current_organization.stripe_customer_id.present?
        redirect_to admin_billing_path, alert: "Billing portal is not available."
        return
      end

      session = StripeService.create_portal_session(
        organization: current_organization,
        return_url: admin_billing_url,
      )
      redirect_to session.url, allow_other_host: true
    end

    private

    def require_admin
      unless current_user&.admin?
        redirect_to root_path, alert: "Admin access required."
      end
    end

    def demo_billing_enabled?
      ENV["DEMO_BILLING"] == "1"
    end
    helper_method :demo_billing_enabled?

    def skip_pundit?
      true
    end
  end
end
