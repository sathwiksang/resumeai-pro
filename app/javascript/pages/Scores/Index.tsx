import { useState, useMemo } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { motion } from "framer-motion"
import { BarChart3, FileText, Briefcase, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Badge, EmptyState, Input } from "@/components/ui"
import { ScoreGauge } from "@/components/score"
import { scoreColor, formatRelativeTime, cn } from "@/lib/utils"
import type { PaginationMeta } from "@/types"

interface ScoreListItem {
  id: number
  overall_score: number | null
  grade: string | null
  status: string
  resume_filename: string
  job_title: string
  created_at: string
}

interface ScoresIndexProps {
  scores: ScoreListItem[]
  pagination: PaginationMeta
  filters: {
    status: string | null
    grade: string | null
  }
}

function statusVariant(status: string): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "completed": return "success"
    case "queued": return "default"
    case "analyzing": return "warning"
    case "error": return "danger"
    default: return "default"
  }
}

const GRADES = ["A+", "A", "B+", "B", "C+", "C", "D", "F"]
const STATUSES = ["completed", "analyzing", "queued", "error"]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
}

export default function ScoresIndex({ scores, pagination, filters }: ScoresIndexProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "score">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const filteredScores = useMemo(() => {
    let result = [...scores]

    // Client-side search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.resume_filename.toLowerCase().includes(q) ||
          s.job_title.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "score") {
        const aScore = a.overall_score ?? -1
        const bScore = b.overall_score ?? -1
        return sortDir === "desc" ? bScore - aScore : aScore - bScore
      }
      // date
      return sortDir === "desc"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    return result
  }, [scores, searchQuery, sortBy, sortDir])

  function applyFilter(key: string, value: string | null) {
    const params: Record<string, string> = {}
    if (key === "grade") {
      if (value && value !== filters.grade) params.grade = value
      if (filters.status) params.status = filters.status
    } else {
      if (value && value !== filters.status) params.status = value
      if (filters.grade) params.grade = filters.grade
    }
    router.get("/resume_scores", params, { preserveState: true })
  }

  function toggleSort(newSortBy: "date" | "score") {
    if (sortBy === newSortBy) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortBy(newSortBy)
      setSortDir("desc")
    }
  }

  return (
    <AuthenticatedLayout title="Score Analysis">
      <Head title="Score Analysis" />

      {scores.length === 0 && !filters.grade && !filters.status ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={BarChart3}
              title="No scores yet"
              description="Upload a resume and match it against a job description to generate your first AI score."
              actionLabel="Quick Score"
              actionHref="/quick-score"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filter Bar */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resumes or jobs..."
                    className="pl-9"
                  />
                </div>

                {/* Grade filter */}
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-foreground-muted" />
                  <select
                    value={filters.grade || ""}
                    onChange={(e) => applyFilter("grade", e.target.value || null)}
                    className="h-10 rounded-[var(--radius-md)] border border-border bg-surface-elevated px-3 text-sm text-foreground"
                  >
                    <option value="">All Grades</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                <select
                  value={filters.status || ""}
                  onChange={(e) => applyFilter("status", e.target.value || null)}
                  className="h-10 rounded-[var(--radius-md)] border border-border bg-surface-elevated px-3 text-sm text-foreground"
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>

                {/* Sort buttons */}
                <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("date")}
                    className={cn(
                      "flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors",
                      sortBy === "date" ? "bg-brand text-white" : "text-foreground-muted hover:text-foreground"
                    )}
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    Date
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSort("score")}
                    className={cn(
                      "flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors",
                      sortBy === "score" ? "bg-brand text-white" : "text-foreground-muted hover:text-foreground"
                    )}
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    Score
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Card Grid */}
          {filteredScores.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="mx-auto h-8 w-8 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground-muted">
                  No scores match your search or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredScores.map((score) => (
                <motion.div key={score.id} variants={item}>
                  <Link href={`/resume_scores/${score.id}`}>
                    <Card hover className="h-full transition-shadow hover:shadow-card-hover">
                      <CardContent>
                        <div className="flex items-start gap-4">
                          {/* Mini Gauge or Status */}
                          <div className="shrink-0">
                            {score.status === "completed" && score.overall_score !== null && score.grade ? (
                              <ScoreGauge
                                score={score.overall_score}
                                grade={score.grade}
                                animated={false}
                                size="sm"
                              />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center">
                                <Badge variant={statusVariant(score.status)} size="lg">
                                  {score.status}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                              <p className="truncate text-sm font-medium text-foreground">
                                {score.resume_filename}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Briefcase className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                              <p className="truncate text-xs text-foreground-secondary">
                                {score.job_title}
                              </p>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-foreground-muted">
                                {formatRelativeTime(score.created_at)}
                              </span>
                              {score.overall_score !== null && (
                                <span className={`text-sm font-bold tabular-nums ${scoreColor(score.overall_score)}`}>
                                  {score.overall_score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/resume_scores?page=${page}${filters.grade ? `&grade=${filters.grade}` : ""}${filters.status ? `&status=${filters.status}` : ""}`}
                  preserveState
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                    page === pagination.current_page
                      ? "bg-brand text-white"
                      : "text-foreground-muted hover:bg-surface-elevated hover:text-foreground"
                  )}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </AuthenticatedLayout>
  )
}
