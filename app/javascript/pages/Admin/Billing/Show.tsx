import { Head, router } from "@inertiajs/react"
import { motion } from "framer-motion"
import { CreditCard, CheckCircle, Zap, Crown, Building2, AlertTriangle } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, UsageBar } from "@/components/ui"
import type { BillingEvent, UsageSummary } from "@/types"

interface Plan {
  name: string
  key: string
  price: number
  analyses_per_month: number
  features: string[]
}

interface BillingShowProps {
  organization: {
    id: number
    name: string
    plan: string
    monthly_analysis_limit: number
    analyses_used_this_month: number
    subscription_status: string
    current_period_end: string | null
    usage: UsageSummary
  }
  plans: Plan[]
  billing_events: BillingEvent[]
  stripe_enabled: boolean
}

function planIcon(key: string) {
  switch (key) {
    case "free": return Zap
    case "pro": return Crown
    case "enterprise": return Building2
    default: return CreditCard
  }
}

export default function BillingShow({ organization, plans, billing_events, stripe_enabled }: BillingShowProps) {
  const handleUpgrade = (planKey: string) => {
    router.post("/admin/billing/create_checkout", { plan: planKey })
  }

  const handleManageSubscription = () => {
    router.post("/admin/billing/create_portal_session")
  }

  return (
    <AuthenticatedLayout title="Billing & Plans">
      <Head title="Billing & Plans" />

      <div className="space-y-8">
        {!stripe_enabled && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Dev mode: Plan changes are applied directly without Stripe.
            </p>
          </div>
        )}

        {organization.subscription_status === "past_due" && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3">
            <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Your payment is past due. Please update your payment method to avoid service interruption.
            </p>
          </div>
        )}

        {/* Current Plan & Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand" />
                Current Plan
              </CardTitle>
              {organization.plan !== "free" && stripe_enabled && (
                <Button variant="secondary" size="sm" onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-bold text-foreground capitalize">{organization.plan} Plan</h3>
              <Badge variant="brand" size="sm">
                {organization.subscription_status === "active" ? "Active" : organization.subscription_status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UsageBar
                label="Resumes"
                used={organization.usage.resumes.used}
                limit={organization.usage.resumes.limit}
              />
              <UsageBar
                label="Job Descriptions"
                used={organization.usage.job_descriptions.used}
                limit={organization.usage.job_descriptions.limit}
              />
              <UsageBar
                label="Team Members"
                used={organization.usage.members.used}
                limit={organization.usage.members.limit}
              />
              <UsageBar
                label="Analyses (this month)"
                used={organization.usage.analyses.used}
                limit={organization.usage.analyses.limit}
              />
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Available Plans</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = planIcon(plan.key)
              const isCurrent = plan.key === organization.plan
              return (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`relative h-full ${isCurrent ? "border-brand shadow-card" : ""}`}>
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="brand" size="sm">Current Plan</Badge>
                      </div>
                    )}
                    <CardContent className="flex h-full flex-col">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-brand-50 text-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-foreground-muted">/month</span>
                      </div>
                      <ul className="mt-6 flex-1 space-y-2.5">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
                            <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Button
                          variant={isCurrent ? "secondary" : "primary"}
                          className="w-full"
                          disabled={isCurrent}
                          onClick={() => !isCurrent && handleUpgrade(plan.key)}
                        >
                          {isCurrent ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Billing History */}
        {billing_events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {billing_events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.event_type}</p>
                      <p className="text-xs text-foreground-muted">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={event.status === "processed" ? "success" : "default"} size="sm">
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
