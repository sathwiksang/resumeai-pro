import { Head, Link, useForm, router } from "@inertiajs/react"
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button } from "@/components/ui"

interface UserEditProps {
  user: {
    id: number
    first_name: string
    last_name: string
    email_address: string
    role: string
    avatar_url: string | null
    created_at: string
  }
}

export default function UserEdit({ user }: UserEditProps) {
  const { data, setData, put, processing } = useForm({
    user: {
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: user.email_address,
      role: user.role,
    },
  })

  function handleChange(field: string, value: string) {
    setData("user", { ...data.user, [field]: value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put(`/admin/users/${user.id}`)
  }

  function handleDelete() {
    if (confirm(`Remove ${user.first_name} ${user.last_name} from the team?`)) {
      router.delete(`/admin/users/${user.id}`)
    }
  }

  return (
    <AuthenticatedLayout>
      <Head title={`Edit: ${user.first_name} ${user.last_name}`} />

      <div className="mb-6">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Team
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Edit Team Member
        </h1>
      </div>

      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">First name</label>
                  <input
                    type="text"
                    required
                    value={data.user.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Last name</label>
                  <input
                    type="text"
                    required
                    value={data.user.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={data.user.email_address}
                  onChange={(e) => handleChange("email_address", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
                <select
                  value={data.user.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                >
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="danger" size="sm" onClick={handleDelete} className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
                <div className="flex items-center gap-3">
                  <Link href="/admin/users">
                    <Button variant="ghost" type="button">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={processing} className="gap-2">
                    {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
