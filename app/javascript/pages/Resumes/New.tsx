import { Head, Link, useForm } from "@inertiajs/react"
import { motion } from "framer-motion"
import { Upload, FileText, ArrowLeft, X, Loader2, CloudUpload } from "lucide-react"
import { useCallback, useState } from "react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button } from "@/components/ui"

export default function ResumesNew() {
  const { data, setData, post, processing } = useForm<{
    document: File | null
    filename: string
  }>({
    document: null,
    filename: "",
  })

  const [dragActive, setDragActive] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setData({ document: file, filename: file.name })
    }
  }, [setData])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData({ document: file, filename: file.name })
    }
  }, [setData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.document) return
    post("/resumes", {
      forceFormData: true,
    })
  }

  function clearFile() {
    setData({ document: null, filename: "" })
  }

  const acceptedTypes = ".pdf,.doc,.docx,.txt,.rtf"
  const fileSize = data.document ? (data.document.size / 1024 / 1024).toFixed(2) : null

  return (
    <AuthenticatedLayout>
      <Head title="Upload Resume" />

      <div className="mb-6">
        <Link
          href="/resumes"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Resumes
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Upload Resume
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Upload a resume to parse and score against job descriptions.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dropzone */}
              {!data.document ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed p-12 transition-all duration-200 ${
                    dragActive
                      ? "border-brand bg-brand-50/50"
                      : "border-border hover:border-brand/40 hover:bg-surface-elevated/50"
                  }`}
                >
                  <input
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <CloudUpload className={`h-12 w-12 ${dragActive ? "text-brand" : "text-foreground-muted"}`} />
                  <p className="mt-4 text-sm font-medium text-foreground">
                    {dragActive ? "Drop your file here" : "Drag & drop your resume"}
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    or click to browse. PDF, DOCX, TXT — max 10MB
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {data.filename}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {fileSize} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-foreground-muted hover:bg-surface hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-end gap-3">
                <Link href="/resumes">
                  <Button variant="ghost" type="button">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!data.document || processing}
                  className="gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Resume
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
