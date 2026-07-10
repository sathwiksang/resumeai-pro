import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  Monitor,
  Server,
  Brain,
  Database,
  Cloud,
  Gem,
  Code,
  FileCode,
  Cpu,
  HardDrive,
  Container,
  GitBranch,
  Layers,
  Shield,
  Lock,
  ArrowRight,
  Upload,
  FileSearch,
  Binary,
  BarChart3,
  Lightbulb,
  Workflow,
} from "lucide-react"
import { MarketingLayout } from "@/layouts/MarketingLayout"
import {
  SectionHeader,
  ArchitectureDiagram,
  TechStackCard,
  ScoringPipelineDiagram,
} from "@/components/docs"
import { Button, Badge } from "@/components/ui"
import type { PipelineStage } from "@/components/docs"

const archLayers = [
  {
    label: "Client Layer",
    color: "bg-brand-50",
    textColor: "text-brand",
    items: [
      { icon: Monitor, name: "React 19" },
      { icon: Code, name: "TypeScript" },
      { icon: FileCode, name: "Tailwind CSS 4" },
      { icon: Layers, name: "Inertia.js" },
    ],
  },
  {
    label: "Server Layer",
    color: "bg-purple-50",
    textColor: "text-purple-600",
    items: [
      { icon: Gem, name: "Rails 8" },
      { icon: Shield, name: "Pundit" },
      { icon: Workflow, name: "Solid Queue" },
      { icon: Server, name: "Puma" },
    ],
  },
  {
    label: "AI Layer",
    color: "bg-success-50",
    textColor: "text-success-600",
    items: [
      { icon: Brain, name: "Ollama" },
      { icon: Cpu, name: "qwen2.5:3b" },
      { icon: Binary, name: "nomic-embed-text" },
    ],
  },
  {
    label: "Data Layer",
    color: "bg-warning-50",
    textColor: "text-warning-600",
    items: [
      { icon: Database, name: "PostgreSQL 17" },
      { icon: HardDrive, name: "pgvector" },
      { icon: Layers, name: "Active Storage" },
    ],
  },
  {
    label: "Infrastructure",
    color: "bg-rose-50",
    textColor: "text-rose-600",
    items: [
      { icon: Container, name: "Docker" },
      { icon: Cloud, name: "Kamal 2" },
      { icon: GitBranch, name: "GitHub Actions" },
    ],
  },
]

const techStack = [
  { icon: Gem, name: "Rails 8", version: "8.1", role: "Backend framework with Inertia.js SSR adapter", accentColor: "bg-red-50 text-red-600" },
  { icon: Monitor, name: "React 19", version: "19.2", role: "Component-driven UI with hooks and concurrent features", accentColor: "bg-brand-50 text-brand" },
  { icon: Code, name: "TypeScript", version: "5.9", role: "Type-safe frontend with strict mode enabled", accentColor: "bg-blue-50 text-blue-600" },
  { icon: Database, name: "PostgreSQL", version: "17", role: "Primary database with JSONB and full-text search", accentColor: "bg-indigo-50 text-indigo-600" },
  { icon: HardDrive, name: "pgvector", version: "0.8", role: "768-dim vector storage with HNSW cosine indexing", accentColor: "bg-purple-50 text-purple-600" },
  { icon: Brain, name: "Ollama", version: "0.15", role: "Local AI inference — zero external API calls", accentColor: "bg-success-50 text-success-600" },
  { icon: Layers, name: "Inertia.js", version: "3.17", role: "SPA-like navigation without API boilerplate", accentColor: "bg-cyan-50 text-cyan-600" },
  { icon: Workflow, name: "Solid Queue", version: "1.1", role: "Database-backed job queue with priorities", accentColor: "bg-orange-50 text-orange-600" },
  { icon: FileCode, name: "Tailwind CSS", version: "4.2", role: "Utility-first CSS with design token system", accentColor: "bg-teal-50 text-teal-600" },
  { icon: Cloud, name: "Kamal 2", version: "2.5", role: "Zero-downtime deployment with Docker", accentColor: "bg-rose-50 text-rose-600" },
  { icon: Container, name: "Docker", version: "27", role: "Multi-stage builds for optimized images", accentColor: "bg-sky-50 text-sky-600" },
  { icon: GitBranch, name: "GitHub Actions", version: "—", role: "CI/CD: lint, test, security scan, deploy", accentColor: "bg-gray-100 text-gray-600" },
]

const pipelineStages: PipelineStage[] = [
  {
    icon: Upload,
    label: "Document Upload",
    color: "bg-brand-50 text-brand",
    inputs: ["PDF/DOCX/TXT file", "Active Storage blob"],
    processing: "Validate file type, size (max 10MB), and content. Store via Active Storage with virus scanning.",
    outputs: ["Stored document", "File metadata", "Processing job enqueued"],
  },
  {
    icon: FileSearch,
    label: "Text Extraction",
    color: "bg-purple-50 text-purple-600",
    inputs: ["Stored document", "File type metadata"],
    processing: "3-level fallback: pdf-reader → pdftotext → OCR. Extract structured text preserving sections and formatting.",
    outputs: ["Raw text content", "Section boundaries", "Parsing confidence score"],
  },
  {
    icon: Binary,
    label: "Embedding Generation",
    color: "bg-cyan-50 text-cyan-600",
    inputs: ["Extracted text", "nomic-embed-text model"],
    processing: "Generate 768-dimensional vector via Ollama. Store in pgvector with HNSW index (ef_construction=64, m=16).",
    outputs: ["768-dim embedding vector", "pgvector record", "Index updated"],
  },
  {
    icon: Brain,
    label: "LLM Analysis",
    color: "bg-success-50 text-success-600",
    inputs: ["Resume text", "Job description text", "qwen2.5:3b model"],
    processing: "Chain-of-thought prompted analysis: evaluate skills, experience, education, and fit with structured JSON output.",
    outputs: ["Dimension scores (6)", "Strengths/weaknesses", "Recommendations"],
  },
  {
    icon: BarChart3,
    label: "Score Computation",
    color: "bg-warning-50 text-warning-600",
    inputs: ["BM25F keyword score", "Cosine similarity", "LLM dimension scores"],
    processing: "Weighted combination: keyword (30%) + semantic (20%) + LLM (50%). Compute letter grade from composite.",
    outputs: ["Overall score (0-100)", "Letter grade (A+ to F)", "Dimension breakdown"],
  },
  {
    icon: Lightbulb,
    label: "Recommendation Engine",
    color: "bg-rose-50 text-rose-600",
    inputs: ["Dimension scores", "Strengths/weaknesses", "Gap analysis"],
    processing: "Generate prioritized, actionable recommendations for resume improvement based on scoring gaps.",
    outputs: ["Ranked recommendations", "Priority labels", "Improvement areas"],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function Architecture() {
  return (
    <MarketingLayout activeNav="Architecture">
      <Head title="Architecture — ResumeAI Pro" />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[400px] w-[600px] rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/4 h-[300px] w-[400px] rounded-full bg-brand/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader
            badge="Architecture"
            badgeVariant="brand"
            title="Built for Scale, Privacy, and Intelligence"
            subtitle="A modern, production-grade architecture designed for on-premise AI inference, multi-tenant isolation, and zero-downtime deployment."
            className="text-center"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {["Rails 8", "React 19", "PostgreSQL 17", "pgvector", "Ollama", "Docker"].map((tech) => (
              <Badge key={tech} variant="muted" size="sm">{tech}</Badge>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            badge="System Overview"
            title="5-Layer Architecture"
            subtitle="Click each layer to explore the technologies that power ResumeAI Pro."
            className="mb-10 text-center"
          />
          <ArchitectureDiagram layers={archLayers} />
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="border-t border-border bg-surface-elevated/50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            badge="Tech Stack"
            title="Technologies We Use"
            subtitle="Every technology chosen for a specific purpose — no bloat, no unnecessary dependencies."
            className="mb-10 text-center"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech) => (
              <TechStackCard key={tech.name} {...tech} />
            ))}
          </div>
        </div>
      </section>

      {/* Scoring Pipeline */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            badge="Pipeline"
            title="Scoring Pipeline"
            subtitle="Click any stage to see inputs, processing details, and outputs."
            className="mb-10 text-center"
          />
          <ScoringPipelineDiagram stages={pipelineStages} />
        </div>
      </section>

      {/* Security Section */}
      <section className="border-t border-border bg-surface-elevated/50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            badge="Security"
            title="Privacy by Architecture"
            subtitle="Security isn't a feature — it's the foundation of how ResumeAI Pro is built."
            className="mb-10 text-center"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { icon: Lock, title: "Zero External API Calls", desc: "All AI inference runs on local Ollama. No data is sent to OpenAI, Google, or any external service." },
              { icon: Database, title: "Local Data Storage", desc: "PostgreSQL + pgvector on your infrastructure. No cloud storage for document content or embeddings." },
              { icon: Shield, title: "Multi-Tenant Isolation", desc: "acts_as_tenant ensures complete data isolation between organizations. No cross-tenant data leakage." },
              { icon: Server, title: "On-Premise Deployment", desc: "Deploy on your own servers with Docker + Kamal. Full control over your data and infrastructure." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-success-50 text-success-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-display text-2xl font-bold text-foreground">Explore the Technical Details</h3>
          <p className="mt-3 text-foreground-secondary">
            Dive into algorithms, data models, and performance benchmarks.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/docs">
              <Button size="lg" className="gap-2">
                Read the Docs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registration/new">
              <Button variant="secondary" size="lg">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
