import { useState, useEffect } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  ArrowLeft, FileText, Briefcase, Clock, Brain,
  Target, GraduationCap, Code, Palette, AlertTriangle,
  Loader2, Zap, BarChart3, Lightbulb, Search,
  Layers, Download,
} from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs } from "@/components/ui"
import { ScoreGauge, RadarChart, DimensionCard, KeywordCloud, RecommendationList, StrengthsWeaknesses } from "@/components/score"
import { scoreColor, formatDate } from "@/lib/utils"
import { useAnimationTimeline } from "@/hooks/useAnimationTimeline"
import type { ResumeScore, Recommendation, KeywordAnalysis } from "@/types"

interface ScoreShowProps {
  score: ResumeScore & {
    resume: { id: number; filename: string } | null
    job_description: { id: number; title: string; company: string | null } | null
  }
}

export default function ScoreShow({ score }: ScoreShowProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const isAnalyzing = score.status === "analyzing" || score.status === "queued"
  const isError = score.status === "error"
  const isCompleted = score.status === "completed"
  const { isReady } = useAnimationTimeline(isCompleted)

  // Poll for updates while analyzing
  useEffect(() => {
    if (!isAnalyzing) return
    const interval = setInterval(() => {
      router.reload({ only: ["score"] })
    }, 3000)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  // === Analyzing state ===
  if (isAnalyzing) {
    return (
      <AuthenticatedLayout>
        <Head title="Analyzing..." />
        <div className="flex flex-col items-center justify-center py-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-16 w-16 text-brand" />
          </motion.div>
          <h2 className="mt-6 font-display text-xl font-bold text-foreground">
            Analyzing your resume...
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Our AI is scoring your resume against the job description.
          </p>
          <div className="mt-8 w-full max-w-xs space-y-3">
            {[
              { label: "Parsing document", delay: 0 },
              { label: "Extracting keywords", delay: 0.5 },
              { label: "Semantic analysis", delay: 1.0 },
              { label: "LLM evaluation", delay: 1.5 },
              { label: "Calculating scores", delay: 2.0 },
            ].map((step) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay, duration: 0.3 }}
                className="flex items-center gap-3 text-sm text-foreground-secondary"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                {step.label}
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-foreground-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            This usually takes 10-30 seconds
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  // === Error state ===
  if (isError) {
    return (
      <AuthenticatedLayout>
        <Head title="Score Error" />
        <div className="mx-auto max-w-lg py-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-danger" />
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">Analysis Failed</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            {score.error_message || "An error occurred during analysis."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/resume_scores">
              <Button variant="secondary">Back to Scores</Button>
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  // === Completed state — Full Dashboard ===
  const overallScore = score.overall_score || 0
  const grade = score.grade || "—"
  const kwAnalysis = score.keyword_analysis as KeywordAnalysis | null
  const recommendations = (score.recommendations || []) as Recommendation[]

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "keywords", label: "Keywords", icon: Search },
    { key: "recommendations", label: "Recommendations", icon: Lightbulb },
  ]

  const matchRate = kwAnalysis
    ? Math.round(
        (kwAnalysis.matched.length /
          Math.max(kwAnalysis.matched.length + kwAnalysis.missing.length + (kwAnalysis.partial?.length || 0), 1)) *
          100
      )
    : 0

  return (
    <AuthenticatedLayout>
      <Head title={`Score: ${overallScore}% — ${score.resume?.filename}`} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/resume_scores"
          className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Scores
        </Link>
        <h1 className="font-display text-lg font-bold text-foreground">
          Resume Score Analysis
        </h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5 print:hidden"
        >
          <Download className="h-3.5 w-3.5" />
          Export PDF
        </Button>
      </div>

      {/* Hero Section: Gauge + Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-surface via-surface to-surface-elevated p-8">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
              {/* Score Gauge */}
              {isReady("gauge") && (
                <ScoreGauge score={overallScore} grade={grade} animated size="lg" />
              )}

              {/* Info Panel */}
              {isReady("info") && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="flex-1 text-center md:text-left"
                >
                  {score.resume && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-foreground-secondary">
                      <FileText className="h-4 w-4 text-foreground-muted" />
                      <span className="font-semibold uppercase tracking-wider text-xs text-foreground-muted">Resume</span>
                      <Link href={`/resumes/${score.resume.id}`} className="font-medium hover:text-brand">
                        {score.resume.filename}
                      </Link>
                    </div>
                  )}
                  {score.job_description && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-foreground-secondary">
                      <Briefcase className="h-4 w-4 text-foreground-muted" />
                      <span className="font-semibold uppercase tracking-wider text-xs text-foreground-muted">Job</span>
                      <Link href={`/job_descriptions/${score.job_description.id}`} className="font-medium hover:text-brand">
                        {score.job_description.title}
                        {score.job_description.company && ` at ${score.job_description.company}`}
                      </Link>
                    </div>
                  )}

                  {/* Meta badges */}
                  <div className="flex flex-wrap gap-2">
                    {score.llm_model && (
                      <Badge variant="default" size="sm" className="gap-1">
                        <Brain className="h-3 w-3" />
                        {score.llm_model}
                      </Badge>
                    )}
                    {score.processing_time_seconds > 0 && (
                      <Badge variant="default" size="sm" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {score.processing_time_seconds.toFixed(1)}s
                      </Badge>
                    )}
                    {score.llm_tokens_used > 0 && (
                      <Badge variant="default" size="sm" className="gap-1">
                        <Zap className="h-3 w-3" />
                        {score.llm_tokens_used.toLocaleString()} tokens
                      </Badge>
                    )}
                    <Badge variant="muted" size="sm" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(score.created_at)}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* 6-Dimension Cards (3x2 grid) */}
          {isReady("dimensions") && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DimensionCard
                icon={Target}
                label="Keyword Match"
                score={score.keyword_score || 0}
                description="How well your resume keywords match the job requirements"
                delay={0}
              />
              <DimensionCard
                icon={Layers}
                label="Semantic Relevance"
                score={score.semantic_score || 0}
                description="AI-measured contextual similarity between your resume and the job"
                delay={0.05}
              />
              <DimensionCard
                icon={Code}
                label="Skills Alignment"
                score={score.skills_score || 0}
                description="How well your technical and soft skills match the requirements"
                delay={0.1}
              />
              <DimensionCard
                icon={Briefcase}
                label="Experience Fit"
                score={score.experience_score || 0}
                description="Relevance and depth of your work experience to the role"
                delay={0.15}
              />
              <DimensionCard
                icon={GraduationCap}
                label="Education Match"
                score={score.education_score || 0}
                description="How well your education background aligns with requirements"
                delay={0.2}
              />
              <DimensionCard
                icon={Palette}
                label="Format & Quality"
                score={score.format_score || 0}
                description="Resume formatting, structure, clarity, and overall presentation"
                delay={0.25}
              />
            </div>
          )}

          {/* Radar Chart */}
          {isReady("radar") && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand" />
                    Score Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadarChart
                    scores={{
                      keyword: score.keyword_score || 0,
                      semantic: score.semantic_score || 0,
                      skills: score.skills_score || 0,
                      experience: score.experience_score || 0,
                      education: score.education_score || 0,
                      format: score.format_score || 0,
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Strengths & Weaknesses */}
          {isReady("panels") && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <StrengthsWeaknesses
                strengths={(score.strengths || []).map((s: unknown) =>
                  typeof s === "string" ? s : (s as { text: string }).text
                )}
                weaknesses={(score.weaknesses || []).map((w: unknown) =>
                  typeof w === "string" ? w : (w as { text: string }).text
                )}
              />
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "keywords" && kwAnalysis && (
        <div className="space-y-6">
          {/* Match rate summary */}
          <Card>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Match Rate</p>
                  <p className={`text-3xl font-bold tabular-nums ${scoreColor(matchRate)}`}>{matchRate}%</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Required Rate</p>
                  <p className="text-3xl font-bold tabular-nums text-foreground">
                    {kwAnalysis.required_match_rate ? `${Math.round(kwAnalysis.required_match_rate)}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Keywords Found</p>
                  <p className="text-3xl font-bold tabular-nums text-foreground">
                    {kwAnalysis.matched.length}
                    <span className="text-lg text-foreground-muted">
                      /{kwAnalysis.matched.length + kwAnalysis.missing.length + (kwAnalysis.partial?.length || 0)}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyword Cloud */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-warning" />
                Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KeywordCloud
                matched={kwAnalysis.matched || []}
                partial={kwAnalysis.partial || []}
                missing={kwAnalysis.missing || []}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="space-y-6">
          {/* Recommendation list */}
          {recommendations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning-500" />
                  Prioritized Recommendations ({recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecommendationList recommendations={recommendations} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground-muted">
                  No recommendations generated for this analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
