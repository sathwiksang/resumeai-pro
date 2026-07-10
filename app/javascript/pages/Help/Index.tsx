import { useState, useMemo } from "react"
import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  Search,
  Upload,
  FileText,
  BarChart3,
  Users,
  Rocket,
  BookOpen,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { AccordionItem } from "@/components/docs"
import { cn } from "@/lib/utils"

const quickStartCards = [
  { icon: Upload, label: "Upload Resume", href: "/resumes/new", color: "bg-brand-50 text-brand" },
  { icon: FileText, label: "Create JD", href: "/job_descriptions/new", color: "bg-purple-50 text-purple-600" },
  { icon: BarChart3, label: "Run Score", href: "/quick-score", color: "bg-success-50 text-success-600" },
  { icon: Users, label: "Invite Team", href: "/admin/invitations", color: "bg-warning-50 text-warning-600" },
]

const categoryGrid = [
  { icon: Rocket, label: "Getting Started", href: "/help/getting-started", desc: "Step-by-step guide to your first score" },
  { icon: Upload, label: "Resume Management", href: "/resumes", desc: "Upload, edit, and organize resumes" },
  { icon: BarChart3, label: "Scoring", href: "/how-it-works", desc: "How scoring works and what grades mean" },
  { icon: Users, label: "Team & Billing", href: "/admin/billing", desc: "Manage members and plan subscription" },
  { icon: AlertCircle, label: "Troubleshooting", href: "/faq", desc: "Common issues and FAQ" },
  { icon: BookOpen, label: "Documentation", href: "/docs", desc: "Technical docs and architecture" },
]

const popularArticles = [
  { q: "How do I upload my first resume?", a: "Navigate to My Resumes → New Resume. You can upload PDF, DOCX, or TXT files up to 10MB. The system automatically extracts text and generates embeddings for AI scoring." },
  { q: "What do the scores and grades mean?", a: "Scores range from 0-100 and are converted to letter grades: A+ (95-100) through F (0-59). Scores combine keyword matching (30%), semantic similarity (20%), and AI analysis (50%) for comprehensive evaluation." },
  { q: "How do I run a quick score?", a: "Go to Quick Score in the sidebar. Paste or upload a resume and job description, then click Score. You'll get instant results with grades, dimension breakdowns, and recommendations." },
  { q: "Can I invite team members?", a: "Admins can invite members via Admin → Invitations. Enter their email and select a role (recruiter or candidate). They'll receive an invitation email with a secure signup link." },
  { q: "How is my data protected?", a: "All AI processing runs locally on your Ollama instance. Resume data and scores are stored in your PostgreSQL database. Zero data is sent to external services." },
  { q: "What happens when I reach my analysis limit?", a: "Your dashboard shows current usage. When you hit the limit, you can upgrade your plan or wait for the next billing cycle. No data is lost and existing scores remain accessible." },
]

export default function HelpIndex() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return popularArticles
    const q = searchQuery.toLowerCase()
    return popularArticles.filter(
      (a) => a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <AuthenticatedLayout title="Help Center">
      <Head title="Help Center" />

      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search help articles..."
          className="w-full rounded-[var(--radius-lg)] border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {/* Quick Start */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground-muted">Quick Start</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickStartCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-5 text-center transition-all duration-200 hover:border-brand/20 hover:shadow-card"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)]", card.color)}>
                <card.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{card.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground-muted">Help Categories</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryGrid.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-4 transition-all duration-200 hover:border-brand/20 hover:shadow-card"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-surface-elevated text-foreground-muted group-hover:text-brand">
                <cat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                <p className="text-xs text-foreground-muted">{cat.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-foreground-muted" />
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Articles */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground-muted">Popular Articles</h2>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface px-5">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <AccordionItem key={article.q} question={article.q} answer={article.a} />
            ))
          ) : (
            <p className="py-6 text-center text-sm text-foreground-muted">No articles match your search.</p>
          )}
        </div>
      </section>

      {/* Link to public docs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[var(--radius-xl)] border border-border bg-surface-elevated p-6 text-center"
      >
        <p className="text-sm text-foreground-secondary">
          Looking for technical documentation, architecture details, or the FAQ?
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link href="/docs" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            Technical Docs <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link href="/architecture" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            Architecture <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            FAQ <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </AuthenticatedLayout>
  )
}
