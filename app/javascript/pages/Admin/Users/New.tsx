import { Head, Link, useForm } from "@inertiajs/react"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button } from "@/components/ui"

export default function UserNew() {
  const { data, setData, post, processing } = useForm({
    user: {
      first_name: "",
      last_name: "",
      email_address: "",
      role: "candidate",
      password: "",
      password_confirmation: "",
    },
  })

  function handleChange(field: string, value: string) {
    setData("user", { ...data.user, [field]: value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post("/admin/users")
  }

  return (
    <AuthenticatedLayout>
      <Head title="Invite Member" />

      <div className="mb-6">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Team
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Invite Team Member
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={data.user.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm password</label>
                <input
                  type="password"
                  required
                  value={data.user.password_confirmation}
                  onChange={(e) => handleChange("password_confirmation", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link href="/admin/users">
                  <Button variant="ghost" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={processing} className="gap-2">
                  {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Inviting...</> : <><UserPlus className="h-4 w-4" />Invite Member</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
