import { Head, Link, router } from "@inertiajs/react"
import { motion } from "framer-motion"
import { Briefcase, Plus, Search, Clock, Building2 } from "lucide-react"
import { useState } from "react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button, Badge, EmptyState } from "@/components/ui"
import { formatRelativeTime } from "@/lib/utils"
import type { PaginationMeta } from "@/types"

interface JDListItem {
  id: number
  title: string
  company: string | null
  status: string
  created_at: string
  updated_at: string
}

interface JDIndexProps {
  job_descriptions: JDListItem[]
  pagination: PaginationMeta
  filters: {
    status: string | null
    search: string | null
  }
}

function statusVariant(status: string): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "ready": return "success"
    case "pending": return "default"
    case "extracting": return "warning"
    case "error": return "danger"
    default: return "default"
  }
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export default function JDIndex({ job_descriptions, pagination, filters }: JDIndexProps) {
  const [search, setSearch] = useState(filters.search || "")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.get("/job_descriptions", { search }, { preserveState: true })
  }

  return (
    <AuthenticatedLayout title="Job Descriptions">
      <Head title="Job Descriptions" />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job descriptions..."
            className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </form>

        <Link href="/job_descriptions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Job Description
          </Button>
        </Link>
      </div>

      {/* JD Grid */}
      {job_descriptions.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={Briefcase}
              title="No job descriptions yet"
              description="Add a job description to start scoring resumes against it."
              actionLabel="Add Job Description"
              actionHref="/job_descriptions/new"
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
            {job_descriptions.map((jd) => (
              <motion.div key={jd.id} variants={item}>
                <Link href={`/job_descriptions/${jd.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-purple-50 text-purple-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <Badge variant={statusVariant(jd.status)} size="sm">
                          {jd.status}
                        </Badge>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {jd.title}
                        </p>
                        {jd.company && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground-muted">
                            <Building2 className="h-3 w-3" />
                            {jd.company}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center gap-1.5 text-xs text-foreground-muted">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(jd.created_at)}
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
                  href={`/job_descriptions?page=${page}`}
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
