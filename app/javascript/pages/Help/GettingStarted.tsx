import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  Upload,
  FileText,
  Zap,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: Upload,
    title: "Upload a Resume",
    description: "Go to My Resumes and upload a PDF, DOCX, or TXT file. The system automatically extracts text, identifies skills, and generates vector embeddings for AI scoring.",
    href: "/resumes/new",
    cta: "Upload Resume",
    color: "bg-brand-50 text-brand border-brand/20",
    ringColor: "ring-brand/20",
  },
  {
    icon: FileText,
    title: "Create a Job Description",
    description: "Add a job description with title, requirements, and desired qualifications. The system parses key requirements for keyword and semantic matching.",
    href: "/job_descriptions/new",
    cta: "Create JD",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    ringColor: "ring-purple-200",
  },
  {
    icon: Zap,
    title: "Run a Score",
    description: "Use Quick Score to match a resume against a job description. The AI analyzes keywords, semantic relevance, skills, experience, education, and formatting.",
    href: "/quick-score",
    cta: "Quick Score",
    color: "bg-success-50 text-success-600 border-success/20",
    ringColor: "ring-success/20",
  },
  {
    icon: BarChart3,
    title: "Review Results",
    description: "View your overall score, letter grade, and 6-dimension breakdown. Read strengths, weaknesses, and prioritized recommendations for improvement.",
    href: "/resume_scores",
    cta: "View Scores",
    color: "bg-warning-50 text-warning-600 border-warning/20",
    ringColor: "ring-warning/20",
  },
  {
    icon: Users,
    title: "Invite Your Team",
    description: "Admins can invite team members as recruiters or candidates. Recruiters can score resumes and manage job descriptions. Candidates can view their own scores.",
    href: "/admin/invitations",
    cta: "Invite Members",
    color: "bg-rose-50 text-rose-600 border-rose-200",
    ringColor: "ring-rose-200",
  },
]

export default function GettingStarted() {
  return (
    <AuthenticatedLayout title="Getting Started">
      <Head title="Getting Started" />

      <p className="mb-8 max-w-2xl text-sm text-foreground-secondary">
        Follow these 5 steps to start scoring resumes with AI. Each step takes less than a minute.
      </p>

      {/* Vertical Stepper */}
      <div className="relative max-w-2xl">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-0 h-full w-px bg-border" />

        <div className="space-y-8">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                className="relative flex gap-5"
              >
                {/* Step number */}
                <div className={cn(
                  "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-surface ring-4",
                  step.color,
                  step.ringColor
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-foreground-muted">Step {i + 1}</span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">{step.description}</p>
                  <div className="mt-4">
                    <Link href={step.href}>
                      <Button size="sm" variant="secondary" className="gap-1.5">
                        {step.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Completion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="relative mt-8 flex gap-5"
        >
          <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-success/30 bg-success-50 text-success-600 ring-4 ring-success/10">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-1 items-center rounded-[var(--radius-xl)] border border-success/20 bg-success-50/30 p-5">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">You&apos;re all set!</h3>
              <p className="mt-1 text-sm text-foreground-secondary">
                You now have everything you need to score resumes with AI. Explore the dashboard for more features.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AuthenticatedLayout>
  )
}
