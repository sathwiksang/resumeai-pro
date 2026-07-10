import { Head, router } from "@inertiajs/react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeftRight, ChevronDown, Trophy, Target, Layers,
  Code, Briefcase, GraduationCap, Palette, CheckCircle,
  AlertTriangle, BarChart3,
} from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui"
import { scoreColor } from "@/lib/utils"

interface ScoreOption {
  id: number
  resume_filename: string
  job_title: string
  overall_score: number
  grade: string
  created_at: string
}

interface ComparisonData {
  id: number
  resume_filename: string
  job_title: string
  company: string | null
  overall_score: number
  grade: string
  keyword_score: number
  semantic_score: number
  skills_score: number
  experience_score: number
  education_score: number
  format_score: number
  strengths: string[]
  weaknesses: string[]
  created_at: string
}

interface CompareProps {
  available_scores: ScoreOption[]
  left: ComparisonData | null
  right: ComparisonData | null
}

const DIMENSIONS = [
  { key: "keyword_score", label: "Keywords", icon: Target },
  { key: "semantic_score", label: "Semantic", icon: Layers },
  { key: "skills_score", label: "Skills", icon: Code },
  { key: "experience_score", label: "Experience", icon: Briefcase },
  { key: "education_score", label: "Education", icon: GraduationCap },
  { key: "format_score", label: "Format", icon: Palette },
] as const

function ScoreSelector({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: number | null
  options: ScoreOption[]
  onChange: (id: number) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        {label}
      </label>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-4 pr-10 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
        >
          <option value="">Select a score...</option>
          {options.map((s) => (
            <option key={s.id} value={s.id}>
              {s.resume_filename} vs {s.job_title} — {s.overall_score}% ({s.grade})
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      </div>
    </div>
  )
}

function DimensionBar({
  label,
  icon: Icon,
  leftVal,
  rightVal,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  leftVal: number
  rightVal: number
}) {
  const leftWins = leftVal > rightVal
  const rightWins = rightVal > leftVal
  const tie = leftVal === rightVal

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Left score */}
      <div className="w-14 text-right">
        <span className={`text-sm font-bold tabular-nums ${leftWins ? "text-brand" : tie ? "text-foreground" : "text-foreground-muted"}`}>
          {leftVal.toFixed(1)}
        </span>
      </div>

      {/* Left bar */}
      <div className="flex h-3 flex-1 justify-end overflow-hidden rounded-l-full bg-surface-elevated">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${leftVal}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`rounded-l-full ${leftWins ? "bg-brand" : "bg-foreground-muted/40"}`}
        />
      </div>

      {/* Center label */}
      <div className="flex w-24 shrink-0 items-center justify-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-foreground-muted" />
        <span className="text-xs font-medium text-foreground-secondary">{label}</span>
      </div>

      {/* Right bar */}
      <div className="flex h-3 flex-1 overflow-hidden rounded-r-full bg-surface-elevated">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rightVal}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`rounded-r-full ${rightWins ? "bg-purple-500" : "bg-foreground-muted/40"}`}
        />
      </div>

      {/* Right score */}
      <div className="w-14">
        <span className={`text-sm font-bold tabular-nums ${rightWins ? "text-purple-500" : tie ? "text-foreground" : "text-foreground-muted"}`}>
          {rightVal.toFixed(1)}
        </span>
      </div>
    </div>
  )
}

export default function CompareShow({ available_scores, left, right }: CompareProps) {
  const [leftId, setLeftId] = useState<number | null>(left?.id ?? null)
  const [rightId, setRightId] = useState<number | null>(right?.id ?? null)

  function handleCompare() {
    if (leftId && rightId) {
      router.get("/compare", { scores: `${leftId},${rightId}` }, { preserveState: true })
    }
  }

  const winner = left && right
    ? left.overall_score > right.overall_score ? "left" : right.overall_score > left.overall_score ? "right" : "tie"
    : null

  return (
    <AuthenticatedLayout>
      <Head title="Compare Resumes" />

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-purple-50 text-purple-600">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Compare Scores
            </h1>
            <p className="text-sm text-foreground-muted">
              Select two scored resumes to compare side-by-side
            </p>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <Card className="mb-8">
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr,auto,1fr]">
            <ScoreSelector
              label="Resume A"
              value={leftId}
              options={available_scores.filter((s) => s.id !== rightId)}
              onChange={setLeftId}
            />
            <div className="flex items-end justify-center pb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground-muted">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
            </div>
            <ScoreSelector
              label="Resume B"
              value={rightId}
              options={available_scores.filter((s) => s.id !== leftId)}
              onChange={setRightId}
            />
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={!leftId || !rightId}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {left && right && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Overall Score Header */}
          <div className="grid grid-cols-3 gap-4">
            <Card className={`text-center ${winner === "left" ? "ring-2 ring-brand" : ""}`}>
              <CardContent className="py-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Resume A</p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">{left.resume_filename}</p>
                <p className="mt-3 text-4xl font-bold tabular-nums text-brand">{left.overall_score}%</p>
                <p className={`text-lg font-bold ${scoreColor(left.overall_score)}`}>{left.grade}</p>
                {winner === "left" && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand">
                    <Trophy className="h-3 w-3" /> Winner
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex items-center justify-center">
              <CardContent className="py-6 text-center">
                <ArrowLeftRight className="mx-auto h-6 w-6 text-foreground-muted" />
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                  {Math.abs(left.overall_score - right.overall_score).toFixed(1)}
                </p>
                <p className="text-xs text-foreground-muted">Point difference</p>
              </CardContent>
            </Card>

            <Card className={`text-center ${winner === "right" ? "ring-2 ring-purple-500" : ""}`}>
              <CardContent className="py-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Resume B</p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">{right.resume_filename}</p>
                <p className="mt-3 text-4xl font-bold tabular-nums text-purple-500">{right.overall_score}%</p>
                <p className={`text-lg font-bold ${scoreColor(right.overall_score)}`}>{right.grade}</p>
                {winner === "right" && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600">
                    <Trophy className="h-3 w-3" /> Winner
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dimension-by-Dimension Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Dimension Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {DIMENSIONS.map((dim) => (
                  <DimensionBar
                    key={dim.key}
                    label={dim.label}
                    icon={dim.icon}
                    leftVal={(left[dim.key as keyof ComparisonData] as number) || 0}
                    rightVal={(right[dim.key as keyof ComparisonData] as number) || 0}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses Side by Side */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resume A — Key Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {left.strengths.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-success-600">
                      <CheckCircle className="h-3.5 w-3.5" /> Strengths
                    </p>
                    <ul className="space-y-1.5">
                      {left.strengths.slice(0, 4).map((s, i) => (
                        <li key={i} className="text-sm text-foreground-secondary">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {left.weaknesses.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-danger-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> Weaknesses
                    </p>
                    <ul className="space-y-1.5">
                      {left.weaknesses.slice(0, 4).map((w, i) => (
                        <li key={i} className="text-sm text-foreground-secondary">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resume B — Key Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {right.strengths.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-success-600">
                      <CheckCircle className="h-3.5 w-3.5" /> Strengths
                    </p>
                    <ul className="space-y-1.5">
                      {right.strengths.slice(0, 4).map((s, i) => (
                        <li key={i} className="text-sm text-foreground-secondary">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {right.weaknesses.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-danger-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> Weaknesses
                    </p>
                    <ul className="space-y-1.5">
                      {right.weaknesses.slice(0, 4).map((w, i) => (
                        <li key={i} className="text-sm text-foreground-secondary">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!left && !right && (
        <div className="py-16 text-center">
          <ArrowLeftRight className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 font-display text-lg font-bold text-foreground">
            Select two scores to compare
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Pick two resume scores from the dropdowns above to see a detailed side-by-side comparison.
          </p>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
