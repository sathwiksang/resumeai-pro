import { Head, Link, useForm } from "@inertiajs/react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button } from "@/components/ui"

interface ResumeEditProps {
  resume: {
    id: number
    filename: string
    content_type: string
    status: string
    raw_text: string | null
    parsed_data: Record<string, unknown>
    scores_count: number
    created_at: string
    updated_at: string
  }
}

export default function ResumeEdit({ resume }: ResumeEditProps) {
  const { data, setData, put, processing } = useForm({
    resume: {
      filename: resume.filename,
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put(`/resumes/${resume.id}`)
  }

  return (
    <AuthenticatedLayout>
      <Head title={`Edit: ${resume.filename}`} />

      <div className="mb-6">
        <Link
          href={`/resumes/${resume.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Resume
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Edit Resume
        </h1>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="filename" className="mb-1.5 block text-sm font-medium text-foreground">
                  Filename
                </label>
                <input
                  id="filename"
                  type="text"
                  required
                  value={data.resume.filename}
                  onChange={(e) => setData("resume", { ...data.resume, filename: e.target.value })}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link href={`/resumes/${resume.id}`}>
                  <Button variant="ghost" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={processing} className="gap-2">
                  {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
