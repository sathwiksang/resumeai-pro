import { useState } from "react"
import { Head, Link } from "@inertiajs/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Lock,
  BarChart3,
  FileSearch,
  Users,
  CreditCard,
  Layers,
  Zap,
  ChevronDown,
  CheckCircle,
  X,
  ArrowRight,
} from "lucide-react"
import { MarketingLayout } from "@/layouts/MarketingLayout"
import { SectionHeader } from "@/components/docs"
import { Button, Badge } from "@/components/ui"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    color: "bg-brand-50 text-brand",
    summary: "3-method scoring with keyword, semantic, and LLM analysis",
    details: "ResumeAI Pro uses a unique 3-method approach combining BM25F keyword matching (30%), 768-dimensional semantic embeddings (20%), and LLM chain-of-thought reasoning (50%). This provides significantly more accurate scoring than single-method approaches, understanding context, synonyms, and implicit qualifications.",
  },
  {
    icon: Lock,
    title: "100% Private & On-Premise",
    color: "bg-success-50 text-success-600",
    summary: "All AI processing runs locally — zero data leaves your infrastructure",
    details: "Every AI operation runs on your local Ollama instance. Resume data, job descriptions, embeddings, and scores are stored in your PostgreSQL database. No external API calls are made for scoring. Your candidates' data stays where it belongs — on your servers.",
  },
  {
    icon: BarChart3,
    title: "6-Dimension Scoring",
    color: "bg-purple-50 text-purple-600",
    summary: "Comprehensive analysis across keywords, semantics, skills, experience, education, and formatting",
    details: "Each resume is evaluated across six dimensions: keyword match (BM25F term analysis), semantic relevance (vector similarity), skills alignment (technical and soft skills), experience fit (role and years matching), education match (degree and certification), and formatting quality (document structure and clarity).",
  },
  {
    icon: FileSearch,
    title: "Smart Document Parsing",
    color: "bg-cyan-50 text-cyan-600",
    summary: "3-level fallback parser handles PDF, DOCX, and TXT formats reliably",
    details: "Our parsing pipeline uses a 3-level fallback system: Level 1 (pdf-reader gem for clean PDFs), Level 2 (pdftotext for complex layouts), Level 3 (OCR for scanned documents). This ensures reliable text extraction from virtually any resume format, including multi-column layouts and non-standard formatting.",
  },
  {
    icon: Users,
    title: "Multi-Tenant Teams",
    color: "bg-rose-50 text-rose-600",
    summary: "Role-based access with admin, recruiter, and candidate roles",
    details: "Full multi-tenant architecture with organization-based data isolation. Three roles: Admins (full control, team management, billing), Recruiters (scoring, JD management, bulk analysis), and Candidates (view own scores, upload resumes). Invite team members via email with secure token-based onboarding.",
  },
  {
    icon: CreditCard,
    title: "Enterprise Billing",
    color: "bg-warning-50 text-warning-600",
    summary: "Stripe-integrated plans with usage tracking and team limits",
    details: "Three tiers: Free (10 analyses/month), Pro ($29/month — 200 analyses, 5 members), and Enterprise ($99/month — unlimited). Stripe handles payments with webhook-driven billing events. Usage counters track monthly analyses with automatic reset. Plan limits are enforced at the controller level.",
  },
  {
    icon: Layers,
    title: "Bulk Analysis",
    color: "bg-orange-50 text-orange-600",
    summary: "Score multiple resumes against one job description simultaneously",
    details: "Upload multiple resumes and score them all against a single job description in one operation. Background jobs process each resume asynchronously using Solid Queue with polynomial backoff. Real-time progress updates show scoring status for each resume.",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    color: "bg-teal-50 text-teal-600",
    summary: "Async job processing with Solid Queue for fast, reliable scoring",
    details: "Scoring jobs are processed asynchronously via Solid Queue with automatic retries and polynomial backoff. The system handles concurrent analyses efficiently, with priority queuing for real-time quick-score requests. Job monitoring is available through Mission Control at /admin/jobs.",
  },
]

const planFeatures = [
  { name: "Monthly analyses", free: "10", pro: "200", enterprise: "Unlimited" },
  { name: "Team members", free: "2", pro: "5", enterprise: "Unlimited" },
  { name: "AI scoring", free: true, pro: true, enterprise: true },
  { name: "6-dimension analysis", free: true, pro: true, enterprise: true },
  { name: "Bulk analysis", free: false, pro: true, enterprise: true },
  { name: "Resume comparison", free: false, pro: true, enterprise: true },
  { name: "Custom AI models", free: false, pro: false, enterprise: true },
  { name: "API access", free: false, pro: false, enterprise: true },
  { name: "SSO / SAML", free: false, pro: false, enterprise: true },
  { name: "Priority support", free: false, pro: true, enterprise: true },
  { name: "Custom integrations", free: false, pro: false, enterprise: true },
]

export default function Features() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <MarketingLayout activeNav="Features">
      <Head title="Features — ResumeAI Pro" />

      {/* Hero */}
      <section className="px-4 pb-12 pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader
            badge="Features"
            badgeVariant="brand"
            title="Everything You Need to Score Resumes"
            subtitle="A complete AI-powered platform for resume analysis with privacy, multi-tenant teams, and enterprise-grade features built in."
            className="text-center"
          />
        </div>
      </section>

      {/* Feature Accordion Cards */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl space-y-3">
          {features.map((feature, i) => {
            const isExpanded = expandedIndex === i
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className={`flex w-full items-center gap-4 rounded-[var(--radius-xl)] border p-5 text-left transition-all duration-200 ${
                    isExpanded
                      ? "border-brand/30 bg-brand-50/20 shadow-card"
                      : "border-border bg-surface hover:border-brand/20 hover:shadow-card"
                  }`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-0.5 text-xs text-foreground-muted truncate">{feature.summary}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-4">
                        <p className="text-sm leading-relaxed text-foreground-secondary">{feature.details}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Plan Comparison Table */}
      <section className="border-t border-border bg-surface-elevated/50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            badge="Plans"
            title="Compare Plans"
            subtitle="Choose the plan that fits your team. Upgrade or downgrade at any time."
            className="mb-10 text-center"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 pr-4 text-left font-medium text-foreground-muted">Feature</th>
                  <th className="pb-4 px-4 text-center font-semibold text-foreground">Free</th>
                  <th className="pb-4 px-4 text-center">
                    <span className="font-semibold text-brand">Pro</span>
                    <Badge variant="brand" size="sm" className="ml-2">Popular</Badge>
                  </th>
                  <th className="pb-4 pl-4 text-center font-semibold text-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {planFeatures.map((row) => (
                  <tr key={row.name} className="border-b border-border/50">
                    <td className="py-3 pr-4 text-foreground-secondary">{row.name}</td>
                    <td className="py-3 px-4 text-center">
                      <PlanCell value={row.free} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <PlanCell value={row.pro} />
                    </td>
                    <td className="py-3 pl-4 text-center">
                      <PlanCell value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-display text-2xl font-bold text-foreground">Ready to get started?</h3>
          <p className="mt-3 text-foreground-secondary">
            Start with the free plan — upgrade when you need to.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/registration/new">
              <Button size="lg" className="gap-2">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="secondary" size="lg">How It Works</Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

function PlanCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="font-medium text-foreground">{value}</span>
  }
  return value ? (
    <CheckCircle className="mx-auto h-4 w-4 text-success" />
  ) : (
    <X className="mx-auto h-4 w-4 text-foreground-muted/40" />
  )
}
