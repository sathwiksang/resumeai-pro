import { Head, Link } from "@inertiajs/react"
import { motion } from "framer-motion"
import { Users, Plus, Edit } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Button, Badge, Avatar, EmptyState } from "@/components/ui"
import { formatRelativeTime } from "@/lib/utils"
import type { PaginationMeta } from "@/types"

interface TeamUser {
  id: number
  first_name: string
  last_name: string
  email_address: string
  role: string
  avatar_url: string | null
  created_at: string
}

interface UsersIndexProps {
  users: TeamUser[]
  pagination: PaginationMeta
}

function roleBadgeVariant(role: string) {
  switch (role) {
    case "admin": return "danger" as const
    case "recruiter": return "brand" as const
    case "candidate": return "default" as const
    default: return "default" as const
  }
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
}

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
}

export default function UsersIndex({ users }: UsersIndexProps) {
  return (
    <AuthenticatedLayout title="Team Members">
      <Head title="Team Members" />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-foreground-muted">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
        <Link href="/admin/users/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        </Link>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={Users}
              title="No team members"
              description="Invite your first team member to get started."
              actionLabel="Invite Member"
              actionHref="/admin/users/new"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">Joined</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    variants={item}
                    className="border-b border-border last:border-0 transition-colors hover:bg-surface-elevated/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={user.first_name} lastName={user.last_name} src={user.avatar_url} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-foreground-muted">{user.email_address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={roleBadgeVariant(user.role)} size="sm" className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground-muted">
                        {formatRelativeTime(user.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </Card>
      )}
    </AuthenticatedLayout>
  )
}
