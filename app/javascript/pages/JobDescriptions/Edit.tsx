import { Head, Link, useForm } from "@inertiajs/react"
import { ArrowLeft, Loader2, Plus, X } from "lucide-react"
import { useState } from "react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button, Badge } from "@/components/ui"

interface JDEditProps {
  job_description: {
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
}

export default function JDEdit({ job_description: jd }: JDEditProps) {
  const { data, setData, put, processing } = useForm({
    job_description: {
      title: jd.title,
      company: jd.company || "",
      description: jd.description,
      required_skills: jd.required_skills || [],
      preferred_skills: jd.preferred_skills || [],
    },
  })

  const [requiredSkillInput, setRequiredSkillInput] = useState("")
  const [preferredSkillInput, setPreferredSkillInput] = useState("")

  function addSkill(type: "required_skills" | "preferred_skills", input: string, setInput: (v: string) => void) {
    const skill = input.trim()
    if (skill && !data.job_description[type].includes(skill)) {
      setData("job_description", {
        ...data.job_description,
        [type]: [...data.job_description[type], skill],
      })
      setInput("")
    }
  }

  function removeSkill(type: "required_skills" | "preferred_skills", skill: string) {
    setData("job_description", {
      ...data.job_description,
      [type]: data.job_description[type].filter((s) => s !== skill),
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put(`/job_descriptions/${jd.id}`)
  }

  return (
    <AuthenticatedLayout>
      <Head title={`Edit: ${jd.title}`} />

      <div className="mb-6">
        <Link
          href={`/job_descriptions/${jd.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Job Description
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Edit Job Description
        </h1>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                  Job Title <span className="text-danger">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={data.job_description.title}
                  onChange={(e) => setData("job_description", { ...data.job_description, title: e.target.value })}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-foreground">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  value={data.job_description.company}
                  onChange={(e) => setData("job_description", { ...data.job_description, company: e.target.value })}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
                  Job Description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={10}
                  value={data.job_description.description}
                  onChange={(e) => setData("job_description", { ...data.job_description, description: e.target.value })}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                />
              </div>

              {/* Required Skills */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Required Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={requiredSkillInput}
                    onChange={(e) => setRequiredSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addSkill("required_skills", requiredSkillInput, setRequiredSkillInput) }
                    }}
                    placeholder="Type and press Enter"
                    className="h-10 flex-1 rounded-[var(--radius-md)] border border-border bg-surface-elevated px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={() => addSkill("required_skills", requiredSkillInput, setRequiredSkillInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {data.job_description.required_skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {data.job_description.required_skills.map((skill) => (
                      <Badge key={skill} variant="danger" size="sm" className="gap-1 pr-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill("required_skills", skill)} className="ml-0.5 rounded-full p-0.5 hover:bg-danger/20">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Preferred Skills */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Preferred Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preferredSkillInput}
                    onChange={(e) => setPreferredSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addSkill("preferred_skills", preferredSkillInput, setPreferredSkillInput) }
                    }}
                    placeholder="Type and press Enter"
                    className="h-10 flex-1 rounded-[var(--radius-md)] border border-border bg-surface-elevated px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={() => addSkill("preferred_skills", preferredSkillInput, setPreferredSkillInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {data.job_description.preferred_skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {data.job_description.preferred_skills.map((skill) => (
                      <Badge key={skill} variant="success" size="sm" className="gap-1 pr-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill("preferred_skills", skill)} className="ml-0.5 rounded-full p-0.5 hover:bg-success/20">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link href={`/job_descriptions/${jd.id}`}>
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
