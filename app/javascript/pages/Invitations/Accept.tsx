import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui"

interface AcceptProps {
  invitation?: {
    token: string
    email: string
    role: string
    organization_name: string
    inviter_name: string
    expires_at: string
  }
  error?: string
}

export default function Accept({ invitation, error }: AcceptProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    password: "",
    password_confirmation: "",
  })
  const [submitting, setSubmitting] = useState(false)

  if (error) {
    return (
      <>
        <Head title="Invitation" />
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <p className="text-foreground-muted text-lg">{error}</p>
              <a href="/session/new" className="mt-4 inline-block text-brand hover:underline">
                Go to login
              </a>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (!invitation) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    router.post(`/invitations/${invitation.token}`, form, {
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <>
      <Head title={`Join ${invitation.organization_name}`} />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Join {invitation.organization_name}</CardTitle>
            <p className="text-sm text-foreground-muted text-center mt-2">
              {invitation.inviter_name} invited you to join as a {invitation.role}.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <Input type="email" value={invitation.email} disabled />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                <Input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Accept Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
