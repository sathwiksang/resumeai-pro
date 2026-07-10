import { Head, Link } from "@inertiajs/react"
import { ArrowLeft, Clock, FileText, BarChart3 } from "lucide-react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, Badge, Avatar, Button } from "@/components/ui"
import { formatDate } from "@/lib/utils"

interface UserDetail {
  id: number
  first_name: string
  last_name: string
  email_address: string
  role: string
  avatar_url: string | null
  created_at: string
  resumes_count: number
  scores_count: number
  last_active_at: string | null
}

interface UserShowProps {
  user: UserDetail
}

function roleBadgeVariant(role: string) {
  switch (role) {
    case "admin": return "danger" as const
    case "recruiter": return "brand" as const
    default: return "default" as const
  }
}

export default function UserShow({ user }: UserShowProps) {
  return (
    <AuthenticatedLayout>
      <Head title={`${user.first_name} ${user.last_name}`} />

      <div className="mb-8">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Team
        </Link>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar firstName={user.first_name} lastName={user.last_name} src={user.avatar_url} size="xl" />
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {user.first_name} {user.last_name}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant={roleBadgeVariant(user.role)} size="sm" className="capitalize">
                    {user.role}
                  </Badge>
                  <span className="text-sm text-foreground-muted">{user.email_address}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center py-6 text-center">
              <FileText className="h-6 w-6 text-brand" />
              <p className="mt-2 text-2xl font-bold text-foreground">{user.resumes_count}</p>
              <p className="text-xs text-foreground-muted">Resumes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6 text-center">
              <BarChart3 className="h-6 w-6 text-success" />
              <p className="mt-2 text-2xl font-bold text-foreground">{user.scores_count}</p>
              <p className="text-xs text-foreground-muted">Scores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6 text-center">
              <Clock className="h-6 w-6 text-warning" />
              <p className="mt-2 text-sm font-medium text-foreground">
                {user.last_active_at ? formatDate(user.last_active_at) : "Never"}
              </p>
              <p className="text-xs text-foreground-muted">Last Active</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Link href={`/admin/users/${user.id}/edit`}>
            <Button variant="secondary">Edit Member</Button>
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
