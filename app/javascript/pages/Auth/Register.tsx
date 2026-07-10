import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { motion } from "framer-motion"
import { User, Mail, Lock, Building2, Globe, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react"
import { useState } from "react"
import { GuestLayout } from "@/layouts/GuestLayout"
import { Button } from "@/components/ui"

export default function Register() {
  const workspaceDomain = (usePage().props.workspace_domain as string) || "resume.sathwiksangeethamproject.dev"
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const { data, setData, post, processing } = useForm({
    organization: {
      name: "",
      subdomain: "",
    },
    user: {
      first_name: "",
      last_name: "",
      email_address: "",
      password: "",
      password_confirmation: "",
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post("/registration")
  }

  function handleOrgChange(field: string, value: string) {
    setData("organization", { ...data.organization, [field]: value })
    // Auto-generate subdomain from org name
    if (field === "name") {
      const subdomain = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      setData("organization", { ...data.organization, name: value, subdomain })
    }
  }

  function handleUserChange(field: string, value: string) {
    setData("user", { ...data.user, [field]: value })
  }

  const canProceedToStep2 = data.organization.name.length >= 2 && data.organization.subdomain.length >= 2

  const passwordStrength = getPasswordStrength(data.user.password)

  return (
    <GuestLayout>
      <Head title="Create Account" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-8 shadow-card">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-foreground">Create your account</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Set up your organization and admin account
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-6 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? "bg-brand text-white" : "bg-success text-white"}`}>
              {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
            </div>
            <div className={`h-0.5 flex-1 rounded-full transition-colors ${step > 1 ? "bg-success" : "bg-border"}`} />
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? "bg-brand text-white" : "bg-surface-elevated text-foreground-muted"}`}>
              2
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Organization */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-sm font-medium text-foreground-secondary">Organization Details</p>

                <div>
                  <label htmlFor="org_name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Organization name
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                      id="org_name"
                      type="text"
                      autoFocus
                      required
                      value={data.organization.name}
                      onChange={(e) => handleOrgChange("name", e.target.value)}
                      placeholder="Acme Inc."
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subdomain" className="mb-1.5 block text-sm font-medium text-foreground">
                    Workspace URL
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                      id="subdomain"
                      type="text"
                      required
                      value={data.organization.subdomain}
                      onChange={(e) => handleOrgChange("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="acme"
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-36 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">
                      .{workspaceDomain}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full"
                  size="lg"
                  disabled={!canProceedToStep2}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: User Account */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-brand hover:text-brand-700 font-medium"
                  >
                    &larr; Back
                  </button>
                  <span className="text-sm text-foreground-secondary">Admin Account</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-foreground">
                      First name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                      <input
                        id="first_name"
                        type="text"
                        autoFocus
                        required
                        value={data.user.first_name}
                        onChange={(e) => handleUserChange("first_name", e.target.value)}
                        placeholder="Jane"
                        className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-foreground">
                      Last name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      required
                      value={data.user.last_name}
                      onChange={(e) => handleUserChange("last_name", e.target.value)}
                      placeholder="Doe"
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pr-4 pl-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={data.user.email_address}
                      onChange={(e) => handleUserChange("email_address", e.target.value)}
                      placeholder="jane@acme.com"
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={data.user.password}
                      onChange={(e) => handleUserChange("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-11 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  {data.user.password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength.level
                                ? passwordStrength.level <= 1
                                  ? "bg-danger"
                                  : passwordStrength.level <= 2
                                  ? "bg-warning"
                                  : passwordStrength.level <= 3
                                  ? "bg-brand"
                                  : "bg-success"
                                : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`mt-1 text-xs ${
                        passwordStrength.level <= 1
                          ? "text-danger"
                          : passwordStrength.level <= 2
                          ? "text-warning"
                          : "text-success"
                      }`}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-foreground">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                      id="password_confirmation"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={data.user.password_confirmation}
                      onChange={(e) => handleUserChange("password_confirmation", e.target.value)}
                      placeholder="Confirm your password"
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                  {data.user.password_confirmation.length > 0 && data.user.password !== data.user.password_confirmation && (
                    <p className="mt-1 text-xs text-danger">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={processing || data.user.password !== data.user.password_confirmation}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-foreground-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-foreground-muted">
            Already have an account?{" "}
            <Link href="/session/new" className="font-medium text-brand hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-center text-xs text-foreground-muted">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </GuestLayout>
  )
}

function getPasswordStrength(password: string): { level: number; label: string } {
  if (password.length === 0) return { level: 0, label: "" }
  if (password.length < 6) return { level: 1, label: "Too short" }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: "Weak" }
  if (score <= 2) return { level: 2, label: "Fair" }
  if (score <= 3) return { level: 3, label: "Strong" }
  return { level: 4, label: "Very strong" }
}
