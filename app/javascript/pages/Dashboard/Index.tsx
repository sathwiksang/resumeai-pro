import { useEffect, useState } from "react"
import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  FileText,
  Briefcase,
  BarChart3,
  TrendingUp,
  Zap,
  Upload,
  ArrowUpRight,
  Activity,
} from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress, EmptyState } from "@/components/ui"
import { ScoreGauge } from "@/components/score"
import { scoreColor, formatRelativeTime } from "@/lib/utils"

interface RecentScore {
  id: number
  overall_score: number
  grade: string
  resume_filename: string
  job_title: string
  created_at: string
}

interface RecentResume {
  id: number
  filename: string
  status: string
  created_at: string
}

interface GradeDistribution {
  [grade: string]: number
}

interface DashboardProps {
  stats: {
    total_resumes: number
    total_job_descriptions: number
    total_scores: number
    average_score: number
    scores_this_month: number
    resumes_pending: number
  }
  recent_scores: RecentScore[]
  recent_resumes: RecentResume[]
  usage: {
    used: number
    limit: number
    plan: string
  } | null
  grade_distribution?: GradeDistribution
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  href?: string
}) {
  const content = (
    <Card hover className="relative overflow-hidden">
      <CardContent className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground-muted">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-foreground-muted" />
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }

  return content
}

function statusBadgeVariant(status: string): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "ready":
    case "completed":
      return "success"
    case "pending":
    case "queued":
      return "default"
    case "parsing":
    case "extracting":
    case "analyzing":
      return "warning"
    case "error":
      return "danger"
    default:
      return "default"
  }
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "#059669",
  "A": "#10B981",
  "B+": "#2563EB",
  "B": "#3B82F6",
  "C+": "#D97706",
  "C": "#F59E0B",
  "D": "#EA580C",
  "F": "#DC2626",
}

function GradeDistributionChart({ distribution }: { distribution: GradeDistribution }) {
  const [Chart, setChart] = useState<React.ComponentType<Record<string, unknown>> | null>(null)

  useEffect(() => {
    import("react-apexcharts").then((mod) => {
      setChart(() => mod.default)
    })
  }, [])

  const grades = Object.keys(distribution).filter((g) => distribution[g] > 0)
  const values = grades.map((g) => distribution[g])
  const colors = grades.map((g) => GRADE_COLORS[g] || "#94A3B8")

  if (!Chart || grades.length === 0) return null

  const options: Record<string, unknown> = {
    chart: { type: "donut", animations: { enabled: true, speed: 800 } },
    labels: grades,
    colors: colors,
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontFamily: "inherit",
      labels: { colors: "var(--color-foreground-secondary)" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: { show: true, fontSize: "14px", fontFamily: "inherit" },
            value: { show: true, fontSize: "20px", fontFamily: "inherit", fontWeight: 700 },
            total: {
              show: true,
              label: "Total",
              fontSize: "12px",
              fontFamily: "inherit",
              color: "var(--color-foreground-muted)",
            },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["var(--color-surface)"] },
    tooltip: { theme: "dark" },
    dataLabels: { enabled: false },
    responsive: [
      { breakpoint: 480, options: { chart: { height: 240 } } },
    ],
  }

  return (
    <Chart
      options={options}
      series={values}
      type="donut"
      height={280}
      width="100%"
    />
  )
}

export default function DashboardIndex({ stats, recent_scores, recent_resumes, usage, grade_distribution }: DashboardProps) {
  return (
    <AuthenticatedLayout title="Dashboard">
      <Head title="Dashboard" />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Resumes"
            value={stats.total_resumes}
            icon={FileText}
            color="bg-brand-50 text-brand"
            href="/resumes"
          />
          <StatCard
            label="Job Descriptions"
            value={stats.total_job_descriptions}
            icon={Briefcase}
            color="bg-purple-50 text-purple-600"
            href="/job_descriptions"
          />
          <StatCard
            label="Scores Analyzed"
            value={stats.total_scores}
            icon={BarChart3}
            color="bg-success-50 text-success-600"
            href="/resume_scores"
          />
          <StatCard
            label="Average Score"
            value={stats.average_score > 0 ? `${stats.average_score}%` : "—"}
            icon={TrendingUp}
            color="bg-warning-50 text-warning-600"
          />
        </motion.div>

        {/* Usage + Quick Actions Row */}
        <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Usage */}
          {usage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand" />
                  Monthly Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-foreground">{usage.used}</span>
                    <span className="text-sm text-foreground-muted">
                      / {usage.limit === -1 ? "\u221E" : usage.limit} analyses
                    </span>
                  </div>
                  {usage.limit > 0 && (
                    <Progress value={usage.used} max={usage.limit} size="md" />
                  )}
                  <Badge variant={usage.plan === "enterprise" ? "brand" : usage.plan === "pro" ? "success" : "default"} size="sm">
                    {usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)} Plan
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className={usage ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link href="/resumes/new">
                  <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Upload Resume</p>
                      <p className="text-xs text-foreground-muted">PDF, DOCX, TXT</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/job_descriptions/new">
                  <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-purple-50 text-purple-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Add Job Description</p>
                      <p className="text-xs text-foreground-muted">Paste or type JD</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/quick-score">
                  <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-success-50 text-success-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Quick Score</p>
                      <p className="text-xs text-foreground-muted">Instant analysis</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grade Distribution + Recent Scores */}
        <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Grade Distribution */}
          {grade_distribution && Object.values(grade_distribution).some((v) => v > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GradeDistributionChart distribution={grade_distribution} />
              </CardContent>
            </Card>
          )}

          {/* Recent Scores */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Scores</CardTitle>
                <Link href="/resume_scores" className="text-sm text-brand hover:text-brand-700 font-medium">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recent_scores.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No scores yet"
                  description="Upload a resume and job description to get your first AI-powered score."
                />
              ) : (
                <div className="space-y-3">
                  {recent_scores.map((score) => (
                    <Link
                      key={score.id}
                      href={`/resume_scores/${score.id}`}
                      className="flex items-center gap-4 rounded-[var(--radius-md)] p-3 transition-colors hover:bg-surface-elevated"
                    >
                      <ScoreGauge
                        score={score.overall_score}
                        grade={score.grade}
                        animated={false}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {score.resume_filename}
                        </p>
                        <p className="truncate text-xs text-foreground-muted">
                          {score.job_title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${scoreColor(score.overall_score)}`}>
                          {score.overall_score}%
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {formatRelativeTime(score.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Resumes */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Resumes</CardTitle>
                <Link href="/resumes" className="text-sm text-brand hover:text-brand-700 font-medium">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recent_resumes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No resumes uploaded"
                  description="Upload your first resume to start scoring."
                  actionLabel="Upload Resume"
                  actionHref="/resumes/new"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recent_resumes.map((resume) => (
                    <Link
                      key={resume.id}
                      href={`/resumes/${resume.id}`}
                      className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border p-3 transition-colors hover:bg-surface-elevated"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {resume.filename}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {formatRelativeTime(resume.created_at)}
                        </p>
                      </div>
                      <Badge variant={statusBadgeVariant(resume.status)} size="sm">
                        {resume.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AuthenticatedLayout>
  )
}
