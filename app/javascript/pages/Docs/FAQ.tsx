import { useState } from "react"
import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import { HelpCircle, Brain, Lock, CreditCard, Code, ArrowRight } from "lucide-react"
import { MarketingLayout } from "@/layouts/MarketingLayout"
import { SectionHeader, AccordionItem } from "@/components/docs"
import { Button, Tabs } from "@/components/ui"

const categories = [
  { key: "general", label: "General", icon: HelpCircle },
  { key: "scoring", label: "Scoring & AI", icon: Brain },
  { key: "privacy", label: "Privacy & Security", icon: Lock },
  { key: "billing", label: "Plans & Billing", icon: CreditCard },
  { key: "technical", label: "Technical", icon: Code },
]

const faqData: Record<string, { q: string; a: string }[]> = {
  general: [
    { q: "What is ResumeAI Pro?", a: "ResumeAI Pro is an AI-powered resume scoring platform that analyzes resumes against job descriptions using local AI models. It provides detailed scoring across 6 dimensions with actionable recommendations." },
    { q: "Who is ResumeAI Pro for?", a: "Recruiters, hiring managers, HR teams, and job seekers who want objective, AI-powered resume evaluation. It works for individuals, small teams, and enterprise organizations." },
    { q: "How is this different from other ATS systems?", a: "Unlike traditional ATS systems that rely on simple keyword matching, ResumeAI Pro combines keyword analysis (BM25F), semantic understanding (vector embeddings), and LLM chain-of-thought reasoning for a comprehensive 3-method scoring approach." },
    { q: "Do I need any technical knowledge to use it?", a: "No. The interface is designed for non-technical users. Simply upload a resume, select a job description, and get instant results with clear grades and recommendations." },
    { q: "What file formats are supported?", a: "PDF, DOCX, and TXT files are supported. Our 3-level parsing pipeline ensures reliable text extraction from virtually any document format." },
    { q: "Can I try it before purchasing?", a: "Yes! The free tier includes 10 analyses per month with full AI scoring capabilities. No credit card required." },
  ],
  scoring: [
    { q: "How does the scoring algorithm work?", a: "We use a weighted 3-method approach: Keyword BM25F matching (30%), Semantic cosine similarity using 768-dimensional embeddings (20%), and LLM chain-of-thought analysis (50%). This combination ensures both precision and contextual understanding." },
    { q: "What are the 6 scoring dimensions?", a: "Keywords (term matching), Semantics (contextual relevance), Skills (technical/soft skills alignment), Experience (role and years match), Education (degree/certification fit), and Formatting (document quality and structure)." },
    { q: "What do the grade levels mean?", a: "A+ (95-100): Exceptional match. A (90-94): Excellent. B+ (85-89): Very good. B (80-84): Good. C+ (75-79): Above average. C (70-74): Average. D (60-69): Below average. F (0-59): Poor match." },
    { q: "What AI models are used?", a: "By default, qwen2.5:3b for analysis, llama3.2:3b for fast processing, and nomic-embed-text for generating 768-dimensional vector embeddings. Enterprise users can configure larger models like qwen2.5:14b." },
    { q: "How accurate is the scoring?", a: "Our 3-method approach provides significantly more accurate results than keyword-only systems. The LLM component understands context, synonyms, and implicit qualifications that simple matching misses." },
    { q: "Can I customize scoring weights?", a: "Enterprise plan users can customize the weights for each scoring method and dimension to match their specific hiring criteria." },
  ],
  privacy: [
    { q: "Is my data sent to external servers?", a: "No. All AI processing runs on your local Ollama instance. Resume data, job descriptions, and scores never leave your infrastructure. Zero external API calls are made for scoring." },
    { q: "Where is my data stored?", a: "All data is stored in your local PostgreSQL database. Vector embeddings are stored using pgvector. No cloud storage is used for document content." },
    { q: "Is the application GDPR compliant?", a: "Yes. Since all data processing happens on-premise, you maintain full control over data residency, retention, and deletion — key requirements for GDPR compliance." },
    { q: "Can I delete my data?", a: "Yes. Users can delete individual resumes, job descriptions, and scores at any time. Admins can delete entire user accounts and all associated data." },
    { q: "Is there an audit log?", a: "Yes. All scoring actions and administrative changes are logged with timestamps and user attribution for compliance and accountability." },
    { q: "How is authentication handled?", a: "We use session-based authentication with secure, encrypted cookies. Passwords are hashed with bcrypt. Role-based access control (RBAC) ensures users only access authorized resources." },
  ],
  billing: [
    { q: "What plans are available?", a: "Free (10 analyses/month, 2 team members), Pro ($29/month — 200 analyses, 5 members, bulk analysis), and Enterprise ($99/month — unlimited analyses, unlimited members, custom models, API access)." },
    { q: "Can I change plans at any time?", a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle." },
    { q: "Is there a free trial for Pro?", a: "Yes! Pro plans come with a 14-day free trial. No credit card required to start." },
    { q: "What payment methods are accepted?", a: "We accept all major credit cards through Stripe. Enterprise customers can arrange invoice-based billing." },
    { q: "What happens when I hit my analysis limit?", a: "You'll see a usage indicator in your dashboard. When you reach your limit, you can upgrade your plan or wait for the next billing cycle. No data is lost." },
    { q: "Can I get a refund?", a: "Yes. We offer a 30-day money-back guarantee on all paid plans. Contact support for assistance." },
  ],
  technical: [
    { q: "What tech stack powers ResumeAI Pro?", a: "Rails 8 backend, React 19 frontend via Inertia.js, PostgreSQL 17 with pgvector for embeddings, Ollama for local AI inference, Solid Queue for background jobs, and Tailwind CSS 4 for styling." },
    { q: "What are the system requirements?", a: "A server with at least 8GB RAM (16GB recommended for larger models), PostgreSQL 17+ with pgvector extension, Ollama with supported AI models, and Node.js 22+ for the frontend build." },
    { q: "How do vector embeddings work?", a: "We use nomic-embed-text to generate 768-dimensional vectors from resume and job description text. These are stored in pgvector and compared using cosine similarity with HNSW indexing for fast retrieval." },
    { q: "Can I use custom AI models?", a: "Enterprise users can configure any Ollama-compatible model. The system is designed to work with any model that supports text generation and embeddings." },
    { q: "How is the application deployed?", a: "We use Kamal 2 for zero-downtime deployments with Docker multi-stage builds. The CI/CD pipeline runs via GitHub Actions with automated testing, security scanning, and deployment." },
    { q: "Is there an API?", a: "API access is available on the Enterprise plan. RESTful endpoints allow integration with your existing HR systems and workflows." },
  ],
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <MarketingLayout activeNav="FAQ">
      <Head title="FAQ — ResumeAI Pro" />

      {/* Hero */}
      <section className="px-4 pb-12 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeader
            badge="FAQ"
            badgeVariant="brand"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about ResumeAI Pro. Can't find what you're looking for? Reach out to our support team."
            className="text-center"
          />
        </div>
      </section>

      {/* Tabs + Accordion */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl">
          <Tabs
            tabs={categories}
            activeTab={activeTab}
            onChange={setActiveTab}
            layoutId="faq-tabs"
            className="mb-8"
          />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {faqData[activeTab]?.map((item) => (
              <AccordionItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface-elevated/50 px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-display text-2xl font-bold text-foreground">Still have questions?</h3>
          <p className="mt-3 text-foreground-secondary">
            Our team is here to help. Get in touch and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/registration/new">
              <Button className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="secondary">Learn How It Works</Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
