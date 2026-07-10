import { Head, useForm, usePage } from "@inertiajs/react"
import { motion } from "framer-motion"
import { Building2, User, Lock, Loader2, Save } from "lucide-react"
import { useState } from "react"
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle, Button, Avatar } from "@/components/ui"

interface SettingsShowProps {
  organization: {
    id: number
    name: string
    subdomain: string
    plan: string
    settings: Record<string, unknown>
  }
  user: {
    id: number
    first_name: string
    last_name: string
    email_address: string
    avatar_url: string | null
    preferences: Record<string, unknown>
  }
}

export default function SettingsShow({ organization, user }: SettingsShowProps) {
  const workspaceDomain = (usePage().props.workspace_domain as string) || "resume.sathwiksangeethamproject.dev"
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "password">("profile")

  const profileForm = useForm({
    section: "profile",
    user: {
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: user.email_address,
    },
  })

  const orgForm = useForm({
    section: "organization",
    organization: {
      name: organization.name,
      subdomain: organization.subdomain,
    },
  })

  const passwordForm = useForm({
    section: "password",
    user: {
      password: "",
      password_confirmation: "",
    },
  })

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    profileForm.put("/admin/settings")
  }

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault()
    orgForm.put("/admin/settings")
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    passwordForm.put("/admin/settings", {
      onSuccess: () => {
        passwordForm.setData("user", { password: "", password_confirmation: "" })
      },
    })
  }

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "organization" as const, label: "Organization", icon: Building2 },
    { key: "password" as const, label: "Password", icon: Lock },
  ]

  return (
    <AuthenticatedLayout title="Settings">
      <Head title="Settings" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-brand-50 text-brand"
                    : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4 text-brand" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <Avatar
                        firstName={user.first_name}
                        lastName={user.last_name}
                        src={user.avatar_url}
                        size="lg"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-foreground-muted">{user.email_address}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">First name</label>
                        <input
                          type="text"
                          value={profileForm.data.user.first_name}
                          onChange={(e) => profileForm.setData("user", { ...profileForm.data.user, first_name: e.target.value })}
                          className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Last name</label>
                        <input
                          type="text"
                          value={profileForm.data.user.last_name}
                          onChange={(e) => profileForm.setData("user", { ...profileForm.data.user, last_name: e.target.value })}
                          className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                      <input
                        type="email"
                        value={profileForm.data.user.email_address}
                        onChange={(e) => profileForm.setData("user", { ...profileForm.data.user, email_address: e.target.value })}
                        className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={profileForm.processing} className="gap-2">
                        {profileForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Profile
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Organization Settings */}
          {activeTab === "organization" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-brand" />
                    Organization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOrgSubmit} className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Organization name</label>
                      <input
                        type="text"
                        value={orgForm.data.organization.name}
                        onChange={(e) => orgForm.setData("organization", { ...orgForm.data.organization, name: e.target.value })}
                        className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Workspace URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={orgForm.data.organization.subdomain}
                          onChange={(e) => orgForm.setData("organization", { ...orgForm.data.organization, subdomain: e.target.value })}
                          className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                        />
                        <a
                          href={`https://${orgForm.data.organization.subdomain}.${workspaceDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-sm text-brand hover:underline"
                        >.{workspaceDomain}</a>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={orgForm.processing} className="gap-2">
                        {orgForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Organization
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Password Settings */}
          {activeTab === "password" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-brand" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">New password</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={passwordForm.data.user.password}
                        onChange={(e) => passwordForm.setData("user", { ...passwordForm.data.user, password: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm new password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.data.user.password_confirmation}
                        onChange={(e) => passwordForm.setData("user", { ...passwordForm.data.user, password_confirmation: e.target.value })}
                        className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={passwordForm.processing} className="gap-2">
                        {passwordForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
