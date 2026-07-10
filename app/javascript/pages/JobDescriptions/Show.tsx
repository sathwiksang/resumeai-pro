import { Head, Link, router } from "@inertiajs/react"
import {
  Briefcase, ArrowLeft, BarChart3, Building2,
  ListChecks,
} from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui"
import { scoreColor, scoreBgColor, formatDate } from "@/lib/utils"

interface JDDetail {
  id: number
  title: string
  company: string | null
  description: string
  requirements: Record<string, unknown>
  required_skills: string[]
  preferred_skills: string[]
  status: string
  scores_count: number
  created_at: string
  updated_at: string
}

interface ScoreSummary {
  id: number
  overall_score: number
  grade: string
  resume_filename: string
  created_at: string
}

interface JDShowProps {
  job_description: JDDetail
  scores: ScoreSummary[]
}

export default function JDShow({ job_description: jd, scores }: JDShowProps) {
  return (
    <AuthenticatedLayout>
      <Head title={jd.title} />

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/job_descriptions"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Job Descriptions
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-purple-50 text-purple-600">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {jd.title}
              </h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-foreground-muted">
                {jd.company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {jd.company}
                  </div>
                )}
                <span>Created {formatDate(jd.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/job_descriptions/${jd.id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm("Delete this job description?")) {
                  router.delete(`/job_descriptions/${jd.id}`)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground-secondary whitespace-pre-wrap">
                {jd.description}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {(jd.required_skills?.length > 0 || jd.preferred_skills?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-brand" />
                  Skills Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jd.required_skills?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                        Required Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {jd.required_skills.map((skill) => (
                          <Badge key={skill} variant="danger" size="sm">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {jd.preferred_skills?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                        Preferred Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {jd.preferred_skills.map((skill) => (
                          <Badge key={skill} variant="success" size="sm">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — Matched Scores */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Matched Resumes</CardTitle>
                <Badge variant="default" size="sm">{scores.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <div className="py-4 text-center">
                  <BarChart3 className="mx-auto h-8 w-8 text-foreground-muted" />
                  <p className="mt-2 text-sm text-foreground-muted">
                    No resumes scored against this JD
                  </p>
                  <Link href="/quick-score">
                    <Button variant="secondary" size="sm" className="mt-3">
                      Score a Resume
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {scores.map((score) => (
                    <Link
                      key={score.id}
                      href={`/resume_scores/${score.id}`}
                      className="flex items-center gap-3 rounded-[var(--radius-md)] p-2.5 transition-colors hover:bg-surface-elevated"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] font-bold text-sm ${scoreBgColor(score.overall_score)} ${scoreColor(score.overall_score)}`}>
                        {score.grade}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {score.resume_filename}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {formatDate(score.created_at)}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${scoreColor(score.overall_score)}`}>
                        {score.overall_score}%
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
