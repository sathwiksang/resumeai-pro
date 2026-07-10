import { Head, Link, router } from "@inertiajs/react"
import { motion } from "framer-motion"
import { FileText, Upload, Search, Clock } from "lucide-react"
import { useState } from "react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button, Badge, EmptyState } from "@/components/ui"
import { formatRelativeTime } from "@/lib/utils"
import type { PaginationMeta } from "@/types"

interface ResumeListItem {
  id: number
  filename: string
  content_type: string
  status: string
  error_message: string | null
  created_at: string
  updated_at: string
}

interface ResumesIndexProps {
  resumes: ResumeListItem[]
  pagination: PaginationMeta
  filters: {
    status: string | null
    search: string | null
  }
}

function statusVariant(status: string): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "ready": return "success"
    case "parsed": return "success"
    case "pending": return "default"
    case "parsing":
    case "extracting": return "warning"
    case "error": return "danger"
    default: return "default"
  }
}

function fileIcon(contentType: string) {
  if (contentType?.includes("pdf")) return "PDF"
  if (contentType?.includes("word") || contentType?.includes("docx")) return "DOC"
  return "TXT"
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export default function ResumesIndex({ resumes, pagination, filters }: ResumesIndexProps) {
  const [search, setSearch] = useState(filters.search || "")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.get("/resumes", { search }, { preserveState: true })
  }

  return (
    <AuthenticatedLayout title="My Resumes">
      <Head title="My Resumes" />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resumes..."
            className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </form>

        <div className="flex items-center gap-3">
          <Link href="/resumes/new">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Resume Grid */}
      {resumes.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={FileText}
              title="No resumes yet"
              description="Upload your first resume to get started with AI-powered scoring."
              actionLabel="Upload Resume"
              actionHref="/resumes/new"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {resumes.map((resume) => (
              <motion.div key={resume.id} variants={item}>
                <Link href={`/resumes/${resume.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand text-xs font-bold">
                          {fileIcon(resume.content_type)}
                        </div>
                        <Badge variant={statusVariant(resume.status)} size="sm">
                          {resume.status}
                        </Badge>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {resume.filename}
                        </p>
                        {resume.error_message && (
                          <p className="mt-1 truncate text-xs text-danger">
                            {resume.error_message}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto flex items-center gap-1.5 text-xs text-foreground-muted">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(resume.created_at)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/resumes?page=${page}`}
                  preserveState
                  className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                    page === pagination.current_page
                      ? "bg-brand text-white"
                      : "text-foreground-muted hover:bg-surface-elevated hover:text-foreground"
                  }`}
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
