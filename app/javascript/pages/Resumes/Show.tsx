import { useEffect } from "react"
import { Head, Link, router } from "@inertiajs/react"
import {
  FileText, ArrowLeft, BarChart3, Briefcase, Clock, CheckCircle,
  AlertCircle, Loader2, User, Mail, Phone, MapPin, Code, GraduationCap,
} from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui"
import { scoreColor, scoreBgColor, formatDate } from "@/lib/utils"
import type { ParsedResumeData } from "@/types"

interface ResumeDetail {
  id: number
  filename: string
  content_type: string
  status: string
  error_message: string | null
  raw_text: string | null
  parsed_data: ParsedResumeData
  scores_count: number
  created_at: string
  updated_at: string
}

interface ScoreSummary {
  id: number
  overall_score: number
  grade: string
  job_title: string
  created_at: string
}

interface ResumeShowProps {
  resume: ResumeDetail
  scores: ScoreSummary[]
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "ready":
    case "parsed":
      return <CheckCircle className="h-5 w-5 text-success" />
    case "error":
      return <AlertCircle className="h-5 w-5 text-danger" />
    case "pending":
    case "parsing":
    case "extracting":
      return <Loader2 className="h-5 w-5 animate-spin text-warning" />
    default:
      return <Clock className="h-5 w-5 text-foreground-muted" />
  }
}

export default function ResumeShow({ resume, scores }: ResumeShowProps) {
  const parsed = resume.parsed_data
  const isProcessing = ["pending", "parsing", "extracting"].includes(resume.status)

  // Poll for updates while processing
  useEffect(() => {
    if (!isProcessing) return
    const interval = setInterval(() => {
      router.reload({ only: ["resume"] })
    }, 3000)
    return () => clearInterval(interval)
  }, [isProcessing])

  return (
    <AuthenticatedLayout>
      <Head title={resume.filename} />

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/resumes"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Resumes
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-brand-50 text-brand">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {resume.filename}
              </h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-foreground-muted">
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={resume.status} />
                  <span className="capitalize">{resume.status}</span>
                </div>
                <span>Uploaded {formatDate(resume.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/quick-score?resume_id=${resume.id}`}>
              <Button className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Score this Resume
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm("Delete this resume?")) {
                  router.delete(`/resumes/${resume.id}`)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {resume.error_message && (
        <Card className="mb-6 border-danger/20 bg-danger-50">
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-danger" />
              <div>
                <p className="text-sm font-medium text-danger">Processing Error</p>
                <p className="text-sm text-danger/80">{resume.error_message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          {parsed?.contact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {parsed.contact.name && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <User className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground">{parsed.contact.name}</span>
                    </div>
                  )}
                  {parsed.contact.email && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground">{parsed.contact.email}</span>
                    </div>
                  )}
                  {parsed.contact.phone && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground">{parsed.contact.phone}</span>
                    </div>
                  )}
                  {parsed.contact.location && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <MapPin className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground">{parsed.contact.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {parsed?.skills && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-purple-500" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parsed.skills.technical?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Technical</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.skills.technical.map((skill) => (
                          <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {parsed.skills.soft?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Soft Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.skills.soft.map((skill) => (
                          <Badge key={skill} variant="brand" size="sm">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {parsed.skills.tools?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Tools</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.skills.tools.map((tool) => (
                          <Badge key={tool} variant="success" size="sm">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {parsed?.experience && parsed.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-warning-500" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {parsed.experience.map((exp, i) => (
                    <div key={i} className={i > 0 ? "border-t border-border pt-6" : ""}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-foreground">{exp.title}</p>
                          <p className="text-sm text-foreground-secondary">{exp.company}</p>
                        </div>
                        <p className="text-xs text-foreground-muted">
                          {exp.start_date} — {exp.end_date}
                        </p>
                      </div>
                      {exp.achievements?.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {exp.achievements.map((a, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-foreground-secondary">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {parsed?.education && parsed.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-success" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parsed.education.map((edu, i) => (
                    <div key={i} className={i > 0 ? "border-t border-border pt-4" : ""}>
                      <p className="font-medium text-foreground">{edu.degree}</p>
                      <p className="text-sm text-foreground-secondary">{edu.institution}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-foreground-muted">
                        <span>{edu.graduation_date}</span>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        {edu.honors && <Badge size="sm" variant="success">{edu.honors}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Text */}
          {resume.raw_text && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Text</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-surface-elevated p-4 font-mono text-xs text-foreground-secondary">
                  {resume.raw_text}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — Scores */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Score History</CardTitle>
            </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <div className="py-4 text-center">
                  <BarChart3 className="mx-auto h-8 w-8 text-foreground-muted" />
                  <p className="mt-2 text-sm text-foreground-muted">No scores yet</p>
                  <Link href="/quick-score">
                    <Button variant="secondary" size="sm" className="mt-3">
                      Score Now
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
                          {score.job_title}
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
