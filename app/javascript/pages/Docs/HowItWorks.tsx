import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  Upload,
  FileSearch,
  Binary,
  Brain,
  BarChart3,
  Lightbulb,
  Search,
  Cpu,
  MessageSquare,
  ArrowRight,
} from "lucide-react"
import { MarketingLayout } from "@/layouts/MarketingLayout"
import {
  SectionHeader,
  FlowDiagram,
  InteractiveWeightSlider,
} from "@/components/docs"
import { Button, Badge } from "@/components/ui"
import type { FlowNode } from "@/components/docs"

const pipelineNodes: FlowNode[] = [
  { icon: Upload, label: "Upload", description: "PDF, DOCX, or TXT file", color: "bg-brand-50 text-brand" },
  { icon: FileSearch, label: "Parse", description: "3-level fallback extraction", color: "bg-purple-50 text-purple-600" },
  { icon: Binary, label: "Embed", description: "768-dim vector encoding", color: "bg-cyan-50 text-cyan-600" },
  { icon: Brain, label: "Extract", description: "LLM entity extraction", color: "bg-success-50 text-success-600" },
  { icon: BarChart3, label: "Score", description: "3-method weighted scoring", color: "bg-warning-50 text-warning-600" },
  { icon: Lightbulb, label: "Recommend", description: "Actionable insights", color: "bg-rose-50 text-rose-600" },
]

const scoringMethods = [
  {
    icon: Search,
    title: "Keyword BM25F",
    weight: "30%",
    color: "bg-brand-50 text-brand",
    description: "Advanced term-frequency matching using BM25F algorithm. Analyzes keyword presence, density, and field-weighted relevance across resume sections.",
  },
  {
    icon: Cpu,
    title: "Semantic Cosine",
    weight: "20%",
    color: "bg-purple-50 text-purple-600",
    description: "768-dimensional vector embeddings via nomic-embed-text. Captures contextual meaning beyond exact keywords — understands synonyms, related concepts, and implicit qualifications.",
  },
  {
    icon: MessageSquare,
    title: "LLM Chain-of-Thought",
    weight: "50%",
    color: "bg-success-50 text-success-600",
    description: "Structured LLM analysis using qwen2.5 with chain-of-thought prompting. Evaluates experience impact, skill depth, cultural fit, and career trajectory in context.",
  },
]

const weightSegments = [
  { label: "Keyword BM25F", percentage: 30, color: "text-brand", bgColor: "bg-brand-50", description: "Term matching" },
  { label: "Semantic Cosine", percentage: 20, color: "text-purple-600", bgColor: "bg-purple-50", description: "Vector similarity" },
  { label: "LLM Analysis", percentage: 50, color: "text-success-600", bgColor: "bg-success-50", description: "AI reasoning" },
]

const gradeScale = [
  { grade: "A+", range: "95–100", color: "bg-success-50 text-success-600 border-success/20", desc: "Exceptional" },
  { grade: "A", range: "90–94", color: "bg-success-50 text-success-600 border-success/20", desc: "Excellent" },
  { grade: "B+", range: "85–89", color: "bg-brand-50 text-brand border-brand/20", desc: "Very Good" },
  { grade: "B", range: "80–84", color: "bg-brand-50 text-brand border-brand/20", desc: "Good" },
  { grade: "C+", range: "75–79", color: "bg-warning-50 text-warning-600 border-warning/20", desc: "Above Avg" },
  { grade: "C", range: "70–74", color: "bg-warning-50 text-warning-600 border-warning/20", desc: "Average" },
  { grade: "D", range: "60–69", color: "bg-orange-50 text-orange-600 border-orange-200", desc: "Below Avg" },
  { grade: "F", range: "0–59", color: "bg-danger-50 text-danger border-danger/20", desc: "Poor Match" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function HowItWorks() {
  return (
    <MarketingLayout activeNav="How It Works">
      <Head title="How It Works — ResumeAI Pro" />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-brand/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader
            badge="How It Works"
            badgeVariant="brand"
            title="AI-Powered Resume Scoring in 6 Steps"
            subtitle="From upload to actionable recommendations — see exactly how ResumeAI Pro analyzes and scores resumes using a multi-method AI pipeline."
            className="text-center"
          />
        </div>
      </section>

      {/* Pipeline Diagram */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <FlowDiagram nodes={pipelineNodes} className="justify-center" />
        </div>
      </section>

      {/* 3 Scoring Methods */}
      <section className="border-t border-border bg-surface-elevated/50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            badge="Scoring Methods"
            title="Three Methods, One Score"
            subtitle="Each resume is analyzed using three complementary techniques, then combined with weighted scoring for maximum accuracy."
            className="text-center"
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {scoringMethods.map((method) => (
              <motion.div
                key={method.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="rounded-[var(--radius-xl)] border border-border bg-surface p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] ${method.color}`}>
                    <method.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="muted" size="sm">{method.weight}</Badge>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{method.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">{method.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Weight Slider */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <SectionHeader
            badge="Weight Distribution"
            title="How Scores Combine"
            subtitle="The final score is a weighted combination of all three methods."
            className="mb-10 text-center"
          />
          <InteractiveWeightSlider segments={weightSegments} />
        </div>
      </section>

      {/* Grade Scale */}
      <section className="border-t border-border bg-surface-elevated/50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            badge="Grading"
            title="Grade Scale"
            subtitle="Scores are converted to letter grades for quick, intuitive evaluation."
            className="mb-10 text-center"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gradeScale.map((g, i) => (
              <motion.div
                key={g.grade}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`rounded-[var(--radius-lg)] border p-4 text-center ${g.color}`}
              >
                <p className="font-display text-2xl font-extrabold">{g.grade}</p>
                <p className="mt-1 text-xs font-medium opacity-80">{g.range}</p>
                <p className="mt-0.5 text-xs opacity-60">{g.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-display text-2xl font-bold text-foreground">Ready to try it?</h3>
          <p className="mt-3 text-foreground-secondary">
            Start scoring resumes in minutes — no credit card required.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/registration/new">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="secondary" size="lg">Explore Features</Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
