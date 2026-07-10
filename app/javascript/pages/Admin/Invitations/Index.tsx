import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { Mail, Clock, CheckCircle, XCircle, Send } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, UsageBar,
} from "@/components/ui"
import type { Invitation, PaginationMeta } from "@/types"

interface InvitationsIndexProps {
  invitations: Invitation[]
  pagination: PaginationMeta
  member_count: number
  member_limit: number
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="warning" size="sm"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    case "accepted":
      return <Badge variant="success" size="sm"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
    case "declined":
      return <Badge variant="default" size="sm"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>
    case "expired":
      return <Badge variant="danger" size="sm">Expired</Badge>
    default:
      return <Badge size="sm">{status}</Badge>
  }
}

export default function InvitationsIndex({ invitations, member_count, member_limit }: InvitationsIndexProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("candidate")
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    router.post("/admin/invitations", { invitation: { email, role } }, {
      onFinish: () => {
        setSending(false)
        setEmail("")
      },
    })
  }

  const handleResend = (id: number) => {
    router.post(`/admin/invitations/${id}/resend`)
  }

  const handleCancel = (id: number) => {
    router.delete(`/admin/invitations/${id}`)
  }

  return (
    <AuthenticatedLayout title="Team Invitations">
      <Head title="Invitations" />

      <div className="space-y-6">
        {/* Member Usage */}
        <Card>
          <CardContent>
            <UsageBar label="Team Members" used={member_count} limit={member_limit} />
          </CardContent>
        </Card>

        {/* Invite Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" />
              Invite Team Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-foreground"
              >
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" disabled={sending || !email}>
                <Send className="h-4 w-4 mr-1" />
                {sending ? "Sending..." : "Send Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invitations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <p className="text-sm text-foreground-muted text-center py-8">No invitations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-foreground-muted">Email</th>
                      <th className="pb-3 font-medium text-foreground-muted">Role</th>
                      <th className="pb-3 font-medium text-foreground-muted">Status</th>
                      <th className="pb-3 font-medium text-foreground-muted">Invited By</th>
                      <th className="pb-3 font-medium text-foreground-muted">Sent</th>
                      <th className="pb-3 font-medium text-foreground-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invitations.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-3 text-foreground">{inv.email}</td>
                        <td className="py-3">
                          <Badge size="sm" className="capitalize">{inv.role}</Badge>
                        </td>
                        <td className="py-3">{statusBadge(inv.status)}</td>
                        <td className="py-3 text-foreground-secondary">{inv.invited_by}</td>
                        <td className="py-3 text-foreground-muted">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {inv.status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleResend(inv.id)}>
                                Resend
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleCancel(inv.id)}>
                                Cancel
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
