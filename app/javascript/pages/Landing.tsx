import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  Shield,
  Zap,
  BarChart3,
  Lock,
  Brain,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight,
  Server,
  Eye,
} from "lucide-react"
import { MarketingLayout } from "@/layouts/MarketingLayout"
import { Button, Badge } from "@/components/ui"
import { StatHighlight } from "@/components/docs"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[300px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="brand" size="md" className="mb-6 inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Local AI — 100% Private
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Score Smarter.{" "}
            <span className="bg-gradient-to-r from-brand via-brand-600 to-purple-600 bg-clip-text text-transparent">
              Hire Better.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary leading-relaxed"
          >
            AI-powered resume scoring that runs entirely on your infrastructure.
            Get detailed analysis, keyword matching, and actionable recommendations — without
            sending a single byte to external APIs.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/registration/new">
              <Button size="xl" className="gap-2 shadow-glow">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/session/new">
              <Button variant="secondary" size="xl" className="gap-2">
                Sign In
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-foreground-muted"
          >
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-success" />
              <span>On-premise AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="h-4 w-4 text-brand" />
              <span>Self-hosted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-purple-500" />
              <span>Zero data leakage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-warning" />
              <span>Free tier available</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-card-hover">
            {/* Fake Dashboard Preview */}
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
              <div className="h-3 w-3 rounded-full bg-danger/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
              <div className="ml-4 h-5 w-48 rounded bg-surface-elevated" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Resumes", value: "847", color: "bg-brand-50 text-brand" },
                { label: "Job Descriptions", value: "124", color: "bg-purple-50 text-purple-600" },
                { label: "Scores Generated", value: "2,340", color: "bg-success-50 text-success-600" },
                { label: "Avg. Score", value: "78.4%", color: "bg-warning-50 text-warning-600" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-4">
                  <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-sm font-bold ${stat.color}`}>
                    {stat.value.charAt(0)}
                  </div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-foreground-muted">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Fake Score List */}
            <div className="mt-4 space-y-2">
              {[
                { name: "john_doe_resume.pdf", score: 92, grade: "A+" },
                { name: "jane_smith_cv.pdf", score: 78, grade: "B+" },
                { name: "alex_johnson_resume.docx", score: 65, grade: "C+" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4 rounded-[var(--radius-md)] bg-surface-elevated px-4 py-3">
                  <FileText className="h-5 w-5 text-foreground-muted" />
                  <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>
                  <span className={`text-sm font-bold ${item.score >= 85 ? "text-success-600" : item.score >= 70 ? "text-brand-600" : "text-warning-600"}`}>
                    {item.score}%
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.score >= 85 ? "bg-success-50 text-success-600" : item.score >= 70 ? "bg-brand-50 text-brand-600" : "bg-warning-50 text-warning-600"}`}>
                    {item.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Advanced LLM scoring with semantic understanding. Goes beyond keyword matching to evaluate context, relevance, and impact.",
      color: "bg-brand-50 text-brand",
    },
    {
      icon: Lock,
      title: "100% Private",
      description:
        "All AI processing runs on your local Ollama instance. Your resumes and job descriptions never leave your infrastructure.",
      color: "bg-success-50 text-success-600",
    },
    {
      icon: BarChart3,
      title: "6-Dimension Scoring",
      description:
        "Comprehensive analysis across keywords, semantics, skills, experience, education, and formatting — with weighted scoring.",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description:
        "Get detailed scores, grades, and actionable recommendations in seconds. Bulk analyze hundreds of resumes at once.",
      color: "bg-warning-50 text-warning-600",
    },
    {
      icon: FileText,
      title: "Smart Parsing",
      description:
        "Upload PDF, DOCX, or TXT files. Our parser extracts structured data including skills, experience, education, and contact info.",
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description:
        "Multi-tenant architecture with role-based access control. Team management, usage tracking, and audit logs built in.",
      color: "bg-rose-50 text-rose-600",
    },
  ]

  return (
    <section className="border-t border-border bg-surface-elevated/50 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="default" size="sm" className="mb-4">
              Features
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Everything you need to score resumes
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-4 max-w-2xl text-foreground-secondary"
          >
            A complete platform for AI-powered resume analysis with privacy at its core.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="group rounded-[var(--radius-xl)] border border-border bg-surface p-6 transition-all duration-200 hover:border-brand/20 hover:shadow-card"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For individual job seekers",
      features: [
        "10 analyses per month",
        "Basic AI scoring",
        "1 team member",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For recruiters and small teams",
      features: [
        "200 analyses per month",
        "Advanced AI scoring",
        "5 team members",
        "Priority support",
        "Bulk analysis",
        "Compare resumes",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large organizations",
      features: [
        "Unlimited analyses",
        "Custom AI models",
        "Unlimited team members",
        "Dedicated support",
        "API access",
        "Custom integrations",
        "SSO / SAML",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="default" size="sm" className="mb-4">
              Pricing
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-4 max-w-xl text-foreground-secondary"
          >
            Start free, upgrade when you need to. No hidden fees, no data selling.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className={`relative rounded-[var(--radius-xl)] border p-6 transition-all duration-200 ${
                plan.popular
                  ? "border-brand bg-surface shadow-card-hover scale-[1.02]"
                  : "border-border bg-surface hover:shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="brand" size="sm">Most Popular</Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-foreground-muted">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-sm text-foreground-muted">{plan.period}</span>
                </div>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground-secondary">
                    <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/registration/new">
                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function HowItWorksTeaser() {
  return (
    <section className="border-t border-border bg-surface-elevated/50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="default" size="sm" className="mb-4">How It Works</Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Three methods. One intelligent score.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-4 max-w-2xl text-foreground-secondary"
          >
            ResumeAI Pro combines keyword analysis, semantic embeddings, and LLM chain-of-thought
            reasoning for scoring that understands context — not just keywords.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          <StatHighlight value={768} suffix="-dim" label="Embeddings" />
          <StatHighlight value={3} label="AI Models" />
          <StatHighlight value={6} label="Scoring Dimensions" />
          <StatHighlight value={100} suffix="%" label="Private" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link href="/how-it-works">
            <Button variant="secondary" className="gap-2">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function CTABanner() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[var(--radius-xl)] border border-brand/20 bg-gradient-to-r from-brand-50 to-purple-50 p-10 text-center dark:from-brand/5 dark:to-purple-500/5"
        >
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Ready to score smarter?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-foreground-secondary">
            Join teams using on-premise AI to evaluate resumes faster and more accurately than ever.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/registration/new">
              <Button size="lg" className="gap-2 shadow-glow">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/architecture">
              <Button variant="secondary" size="lg">View Architecture</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <MarketingLayout>
      <Head title="Score Smarter. Hire Better." />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksTeaser />
      <PricingSection />
      <CTABanner />
    </MarketingLayout>
  )
}
