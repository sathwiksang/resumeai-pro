import { useState, useEffect, useRef } from "react"
import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { MarketingLayout } from "@/layouts/MarketingLayout"
import { SectionHeader, CodeBlock } from "@/components/docs"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

const tocSections = [
  { id: "scoring", label: "Scoring Algorithms" },
  { id: "embeddings", label: "Embedding Pipeline" },
  { id: "parsing", label: "Parsing Pipeline" },
  { id: "services", label: "Service Architecture" },
  { id: "models", label: "Data Models" },
  { id: "performance", label: "Performance" },
]

const bm25fCode = `# BM25F Weighted Score
def bm25f_score(resume, job_description)
  terms = tokenize(job_description)
  field_weights = {
    title: 2.0,
    skills: 1.5,
    experience: 1.2,
    education: 1.0,
    summary: 0.8
  }

  terms.sum do |term|
    field_weights.sum do |field, weight|
      tf = term_frequency(term, resume[field])
      df = document_frequency(term)
      idf = Math.log((n - df + 0.5) / (df + 0.5) + 1)

      numerator = tf * (k1 + 1)
      denominator = tf + k1 * (1 - b + b * field_length / avg_length)

      weight * idf * (numerator / denominator)
    end
  end
end`

const cosineCode = `# Cosine Similarity with pgvector
def semantic_score(resume_embedding, jd_embedding)
  # Embeddings: 768-dim via nomic-embed-text
  # Index: HNSW (ef_construction=64, m=16)

  dot_product = resume_embedding.zip(jd_embedding)
    .sum { |a, b| a * b }

  norm_a = Math.sqrt(resume_embedding.sum { |x| x**2 })
  norm_b = Math.sqrt(jd_embedding.sum { |x| x**2 })

  similarity = dot_product / (norm_a * norm_b)

  # Normalize to 0-100 scale
  ((similarity + 1) / 2 * 100).round(2)
end`

const weightedCode = `# Weighted Score Combination
def compute_final_score(keyword_score, semantic_score, llm_scores)
  weights = {
    keyword:  0.30,  # BM25F term matching
    semantic: 0.20,  # Cosine similarity
    llm:      0.50   # Chain-of-thought analysis
  }

  llm_composite = llm_scores.values.sum / llm_scores.size

  final = (keyword_score  * weights[:keyword]) +
          (semantic_score * weights[:semantic]) +
          (llm_composite  * weights[:llm])

  { score: final.round(2), grade: score_to_grade(final) }
end`

const parsingCode = `# 3-Level Fallback Parsing Pipeline
class ResumeParserService
  def parse(document)
    # Level 1: pdf-reader (fast, clean PDFs)
    text = try_pdf_reader(document)
    return text if text.present? && text.length > 100

    # Level 2: pdftotext (complex layouts)
    text = try_pdftotext(document)
    return text if text.present? && text.length > 100

    # Level 3: OCR (scanned documents)
    text = try_ocr(document)
    return text if text.present?

    raise ParsingError, "Unable to extract text"
  end
end`

const embeddingCode = `# nomic-embed-text Configuration
model: nomic-embed-text
dimensions: 768
max_tokens: 8192
similarity: cosine

# pgvector HNSW Index
CREATE INDEX ON resume_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

# Query (nearest neighbor)
SELECT *, embedding <=> $1 AS distance
FROM resume_embeddings
ORDER BY embedding <=> $1
LIMIT 10;`

const erdData = [
  { name: "Organization", fields: ["name", "plan (enum)", "monthly_analysis_count", "stripe_customer_id"], color: "border-brand/30 bg-brand-50/20" },
  { name: "User", fields: ["email", "role (enum)", "first_name", "last_name", "organization_id (FK)"], color: "border-purple-200 bg-purple-50/20" },
  { name: "Resume", fields: ["title", "content_text", "embedding (vector768)", "skills (jsonb)", "organization_id (FK)"], color: "border-success/30 bg-success-50/20" },
  { name: "JobDescription", fields: ["title", "content_text", "embedding (vector768)", "requirements (jsonb)", "organization_id (FK)"], color: "border-warning/30 bg-warning-50/20" },
  { name: "ResumeScore", fields: ["overall_score", "grade", "dimension_scores (jsonb)", "recommendations (jsonb)", "resume_id (FK)", "job_description_id (FK)"], color: "border-rose-200 bg-rose-50/20" },
]

const benchmarks = [
  { metric: "Resume parsing (PDF)", value: "~1.2s", note: "3-level fallback" },
  { metric: "Embedding generation", value: "~0.8s", note: "768-dim via nomic-embed-text" },
  { metric: "LLM scoring (qwen2.5:3b)", value: "~3-5s", note: "Chain-of-thought analysis" },
  { metric: "BM25F keyword scoring", value: "~50ms", note: "In-memory computation" },
  { metric: "Cosine similarity", value: "~10ms", note: "pgvector HNSW lookup" },
  { metric: "Total end-to-end", value: "~6-8s", note: "Upload to score display" },
  { metric: "Bulk analysis (10 resumes)", value: "~30-45s", note: "Parallel with Solid Queue" },
  { metric: "Vector index search (10k docs)", value: "~5ms", note: "HNSW approximate NN" },
]

function StickyTOC({ activeSection }: { activeSection: string }) {
  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24 space-y-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground-muted">On this page</p>
        {tocSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "block rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors",
              activeSection === section.id
                ? "bg-brand-50 font-medium text-brand"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export default function TechnicalDocs() {
  const [activeSection, setActiveSection] = useState("scoring")
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    )

    tocSections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <MarketingLayout activeNav="Docs">
      <Head title="Technical Documentation — ResumeAI Pro" />

      {/* Hero */}
      <section className="px-4 pb-8 pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader
            badge="Docs"
            badgeVariant="brand"
            title="Technical Documentation"
            subtitle="Deep dive into scoring algorithms, embedding pipeline, service architecture, data models, and performance benchmarks."
            className="text-center"
          />
        </div>
      </section>

      {/* Main content with sidebar TOC */}
      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[1fr_200px]">
          {/* Content */}
          <div className="space-y-20">
            {/* Scoring Algorithms */}
            <div id="scoring">
              <SectionHeader badge="Algorithms" title="Scoring Algorithms" className="mb-8" />

              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">BM25F Keyword Scoring</h3>
                  <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                    BM25F extends the classic BM25 algorithm with field-weighted scoring. Different resume sections
                    (title, skills, experience) receive different importance weights. This ensures that a skill
                    mentioned in the title counts more than one buried in the education section.
                  </p>
                  <CodeBlock title="bm25f_scoring.rb" language="ruby">{bm25fCode}</CodeBlock>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Cosine Similarity</h3>
                  <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                    Vector embeddings capture semantic meaning beyond exact keywords. &quot;Machine Learning Engineer&quot;
                    and &quot;ML Researcher&quot; have high cosine similarity even without shared terms. We use 768-dimensional
                    embeddings from nomic-embed-text stored in pgvector with HNSW indexing.
                  </p>
                  <CodeBlock title="cosine_similarity.rb" language="ruby">{cosineCode}</CodeBlock>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Weighted Combination</h3>
                  <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                    The final score combines all three methods with configurable weights. The default weights
                    (30/20/50) emphasize LLM analysis while maintaining keyword precision and semantic breadth.
                  </p>
                  <CodeBlock title="weighted_scoring.rb" language="ruby">{weightedCode}</CodeBlock>
                </div>
              </div>
            </div>

            {/* Embedding Pipeline */}
            <div id="embeddings">
              <SectionHeader badge="Embeddings" title="Embedding Pipeline" className="mb-8" />

              <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                We use nomic-embed-text to generate 768-dimensional vector embeddings. These are stored in
                PostgreSQL using the pgvector extension with HNSW indexing for fast approximate nearest-neighbor
                search. The index configuration (m=16, ef_construction=64) provides excellent recall with
                sub-5ms query times even at 10k+ documents.
              </p>
              <CodeBlock title="embedding_config.sql" language="sql">{embeddingCode}</CodeBlock>
            </div>

            {/* Parsing Pipeline */}
            <div id="parsing">
              <SectionHeader badge="Parsing" title="Parsing Pipeline" className="mb-8" />

              <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                The 3-level fallback ensures reliable text extraction. Level 1 (pdf-reader) handles clean,
                text-based PDFs quickly. Level 2 (pdftotext) handles complex layouts with multi-column formatting.
                Level 3 (OCR) handles scanned documents as a last resort. Each level checks for a minimum
                text length threshold before accepting the result.
              </p>
              <CodeBlock title="resume_parser_service.rb" language="ruby">{parsingCode}</CodeBlock>
            </div>

            {/* Service Architecture */}
            <div id="services">
              <SectionHeader badge="Services" title="Service Architecture" className="mb-8" />

              <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                The application follows a service object pattern where business logic lives in dedicated
                service classes, keeping controllers thin and models focused on data concerns.
              </p>

              <div className="space-y-3">
                {[
                  { name: "ResumeParserService", desc: "3-level fallback text extraction from uploaded documents" },
                  { name: "EmbeddingService", desc: "Vector embedding generation via Ollama nomic-embed-text" },
                  { name: "KeywordScoringService", desc: "BM25F field-weighted keyword analysis" },
                  { name: "SemanticScoringService", desc: "Cosine similarity computation via pgvector" },
                  { name: "LlmScoringService", desc: "Chain-of-thought LLM analysis with structured output" },
                  { name: "ScoreComputerService", desc: "Weighted score combination and grade assignment" },
                  { name: "RecommendationService", desc: "Prioritized improvement suggestions" },
                ].map((service) => (
                  <div key={service.name} className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <div>
                      <p className="text-sm font-semibold font-mono text-foreground">{service.name}</p>
                      <p className="text-xs text-foreground-secondary">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Models */}
            <div id="models">
              <SectionHeader badge="Data" title="Data Models" className="mb-8" />

              <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                Core models with multi-tenant isolation via acts_as_tenant. All models belong to an Organization,
                ensuring complete data separation between tenants.
              </p>

              <div className="space-y-4">
                {erdData.map((model) => (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className={cn("rounded-[var(--radius-lg)] border p-4", model.color)}
                  >
                    <h4 className="mb-2 font-mono text-sm font-bold text-foreground">{model.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {model.fields.map((field) => (
                        <span key={field} className="rounded-[var(--radius-sm)] bg-white/60 dark:bg-black/10 px-2 py-0.5 font-mono text-xs text-foreground-secondary">
                          {field}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div id="performance">
              <SectionHeader badge="Performance" title="Performance Benchmarks" className="mb-8" />

              <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">
                Benchmarks measured on Apple M-series with 16GB RAM, PostgreSQL 17, and Ollama with
                qwen2.5:3b model. Production numbers may vary based on hardware and model configuration.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 pr-4 text-left font-medium text-foreground-muted">Operation</th>
                      <th className="pb-3 px-4 text-left font-medium text-foreground-muted">Time</th>
                      <th className="pb-3 pl-4 text-left font-medium text-foreground-muted">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarks.map((row) => (
                      <tr key={row.metric} className="border-b border-border/50">
                        <td className="py-2.5 pr-4 text-foreground">{row.metric}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-brand">{row.value}</td>
                        <td className="py-2.5 pl-4 text-foreground-muted">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TOC */}
          <StickyTOC activeSection={activeSection} />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface-elevated/50 px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-display text-2xl font-bold text-foreground">See it in action</h3>
          <p className="mt-3 text-foreground-secondary">
            Try the full scoring pipeline with your own resumes.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/registration/new">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/architecture">
              <Button variant="secondary" size="lg">View Architecture</Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
