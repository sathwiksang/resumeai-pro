import { Head, Link, useForm } from "@inertiajs/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, ArrowLeft, FileText, CloudUpload, X, Loader2,
  ArrowRight, Briefcase, CheckCircle, Brain,
} from "lucide-react"
import { useCallback, useState } from "react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui"

interface JDOption {
  id: number
  title: string
  company: string | null
}

interface ResumeOption {
  id: number
  filename: string
}

interface QuickScoreProps {
  job_descriptions: JDOption[]
  resumes: ResumeOption[]
  preselected_resume_id: number | null
}

export default function QuickScoreNew({ job_descriptions, resumes, preselected_resume_id }: QuickScoreProps) {
  const hasPreselected = preselected_resume_id && resumes.some((r) => r.id === preselected_resume_id)
  const [step, setStep] = useState<1 | 2 | 3>(hasPreselected ? 2 : 1)
  const [resumeMode, setResumeMode] = useState<"existing" | "upload">(hasPreselected ? "existing" : "upload")
  const [jdMode, setJdMode] = useState<"existing" | "new">("existing")
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data, setData, post, processing } = useForm<{
    document: File | null
    resume_id: string
    job_description_id: string
    job_title: string
    job_description_text: string
  }>({
    document: null,
    resume_id: hasPreselected ? String(preselected_resume_id) : "",
    job_description_id: "",
    job_title: "",
    job_description_text: "",
  })

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) setData("document", file)
  }, [setData])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setData("document", file)
  }, [setData])

  const canProceedStep1 = resumeMode === "existing" ? data.resume_id !== "" : data.document !== null
  const canProceedStep2 = jdMode === "existing"
    ? data.job_description_id !== ""
    : data.job_description_text.length >= 20

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    post("/quick-score", { forceFormData: true })
  }

  const isLoading = processing || submitting

  return (
    <AuthenticatedLayout>
      <Head title="Quick Score" />

      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-warning-50 text-warning-600">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Quick Score
            </h1>
            <p className="text-sm text-foreground-muted">
              Upload a resume and match it against a job description in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mx-auto mb-8 flex max-w-2xl items-center gap-2">
        {[
          { num: 1, label: "Upload Resume" },
          { num: 2, label: "Job Description" },
          { num: 3, label: "Review & Score" },
        ].map((s, i) => (
          <div key={s.num} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step > s.num ? "bg-success text-white" : step === s.num ? "bg-brand text-white" : "bg-surface-elevated text-foreground-muted"
            }`}>
              {step > s.num ? <CheckCircle className="h-4 w-4" /> : s.num}
            </div>
            <span className={`hidden text-sm font-medium sm:inline ${step >= s.num ? "text-foreground" : "text-foreground-muted"}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`h-0.5 flex-1 rounded-full ${step > s.num ? "bg-success" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Select or Upload Resume */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Choose Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Toggle between existing and upload */}
                  {resumes.length > 0 && (
                    <div className="mb-6 flex rounded-[var(--radius-md)] border border-border p-1">
                      <button
                        type="button"
                        onClick={() => { setResumeMode("existing"); setData("document", null) }}
                        className={`flex-1 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all ${
                          resumeMode === "existing" ? "bg-brand text-white shadow-sm" : "text-foreground-muted hover:text-foreground"
                        }`}
                      >
                        Select Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => { setResumeMode("upload"); setData("resume_id", "") }}
                        className={`flex-1 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all ${
                          resumeMode === "upload" ? "bg-brand text-white shadow-sm" : "text-foreground-muted hover:text-foreground"
                        }`}
                      >
                        Upload New
                      </button>
                    </div>
                  )}

                  {resumeMode === "existing" && resumes.length > 0 ? (
                    <div className="space-y-2">
                      {resumes.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setData("resume_id", String(r.id))}
                          className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] border p-3 text-left transition-all ${
                            data.resume_id === String(r.id)
                              ? "border-brand bg-brand-50/50"
                              : "border-border hover:border-brand/30"
                          }`}
                        >
                          <FileText className={`h-5 w-5 ${data.resume_id === String(r.id) ? "text-brand" : "text-foreground-muted"}`} />
                          <p className="text-sm font-medium text-foreground">{r.filename}</p>
                          {data.resume_id === String(r.id) && (
                            <CheckCircle className="ml-auto h-5 w-5 text-brand" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      {!data.document ? (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                          onDragLeave={() => setDragActive(false)}
                          onDrop={handleDrop}
                          className={`relative flex flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed p-12 transition-all ${
                            dragActive ? "border-brand bg-brand-50/50" : "border-border hover:border-brand/40"
                          }`}
                        >
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                            onChange={handleFileChange}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                          <CloudUpload className={`h-12 w-12 ${dragActive ? "text-brand" : "text-foreground-muted"}`} />
                          <p className="mt-4 text-sm font-medium text-foreground">Drag & drop your resume</p>
                          <p className="mt-1 text-xs text-foreground-muted">PDF, DOCX, TXT — max 10MB</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{data.document.name}</p>
                            <p className="text-xs text-foreground-muted">{(data.document.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button type="button" onClick={() => setData("document", null)} className="text-foreground-muted hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button type="button" disabled={!canProceedStep1} onClick={() => setStep(2)} className="gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Job Description */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Toggle */}
                  <div className="mb-6 flex rounded-[var(--radius-md)] border border-border p-1">
                    <button
                      type="button"
                      onClick={() => setJdMode("existing")}
                      className={`flex-1 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all ${
                        jdMode === "existing" ? "bg-brand text-white shadow-sm" : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setJdMode("new")}
                      className={`flex-1 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all ${
                        jdMode === "new" ? "bg-brand text-white shadow-sm" : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      Paste New
                    </button>
                  </div>

                  {jdMode === "existing" ? (
                    <div className="space-y-2">
                      {job_descriptions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-foreground-muted">
                          No job descriptions yet.{" "}
                          <button type="button" onClick={() => setJdMode("new")} className="text-brand hover:text-brand-700 font-medium">
                            Paste one instead
                          </button>
                        </p>
                      ) : (
                        job_descriptions.map((jd) => (
                          <button
                            key={jd.id}
                            type="button"
                            onClick={() => setData("job_description_id", String(jd.id))}
                            className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] border p-3 text-left transition-all ${
                              data.job_description_id === String(jd.id)
                                ? "border-brand bg-brand-50/50"
                                : "border-border hover:border-brand/30"
                            }`}
                          >
                            <Briefcase className={`h-5 w-5 ${data.job_description_id === String(jd.id) ? "text-brand" : "text-foreground-muted"}`} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{jd.title}</p>
                              {jd.company && <p className="text-xs text-foreground-muted">{jd.company}</p>}
                            </div>
                            {data.job_description_id === String(jd.id) && (
                              <CheckCircle className="ml-auto h-5 w-5 text-brand" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Job Title</label>
                        <input
                          type="text"
                          value={data.job_title}
                          onChange={(e) => setData("job_title", e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          Job Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          rows={8}
                          value={data.job_description_text}
                          onChange={(e) => setData("job_description_text", e.target.value)}
                          placeholder="Paste the full job description here..."
                          className="w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                      &larr; Back
                    </Button>
                    <Button type="button" disabled={!canProceedStep2} onClick={() => setStep(3)} className="gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Review & Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border p-4">
                      <FileText className="h-6 w-6 text-brand" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-foreground-muted">Resume</p>
                        <p className="text-sm font-medium text-foreground">
                          {resumeMode === "existing"
                            ? resumes.find((r) => String(r.id) === data.resume_id)?.filename || "Selected Resume"
                            : data.document?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border p-4">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-foreground-muted">Job Description</p>
                        <p className="text-sm font-medium text-foreground">
                          {jdMode === "existing"
                            ? job_descriptions.find((j) => String(j.id) === data.job_description_id)?.title || "Selected JD"
                            : data.job_title || "Custom Job Description"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Loading overlay */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-brand-50/50 p-6"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="h-8 w-8 text-brand" />
                        </motion.div>
                        <p className="text-sm font-medium text-brand">
                          Submitting for analysis...
                        </p>
                        <p className="text-xs text-foreground-muted">
                          You'll be redirected to the score dashboard shortly.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={isLoading}>
                      &larr; Back
                    </Button>
                    <Button type="submit" disabled={isLoading} size="lg" className="gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
