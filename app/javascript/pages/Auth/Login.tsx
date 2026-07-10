import { Head, Link, useForm } from "@inertiajs/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2,
  Shield, Brain, BarChart3, Zap, CheckCircle, Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"
import { FlashMessages } from "@/components/FlashMessages"
import { Button } from "@/components/ui"

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Local LLM scoring with 6-dimension evaluation",
  },
  {
    icon: BarChart3,
    title: "Detailed Insights",
    description: "Keyword matching, skill gaps, and actionable recommendations",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "Your data never leaves your infrastructure",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive scores in under 30 seconds",
  },
]

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [passwordChars, setPasswordChars] = useState(0)

  const { data, setData, post, processing } = useForm({
    email_address: "",
    password: "",
  })

  // Track password length for animation
  useEffect(() => {
    setPasswordChars(data.password.length)
  }, [data.password])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post("/session")
  }

  return (
    <>
      <Head title="Sign In" />
      <FlashMessages />

      <div className="flex min-h-screen">
        {/* Left Panel — Branding */}
        <div className="relative hidden w-[480px] shrink-0 overflow-hidden bg-gradient-to-br from-brand via-brand-700 to-purple-700 lg:flex lg:flex-col lg:justify-between">
          {/* Background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
          </div>

          {/* Floating grid dots */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
            {/* Top — Logo */}
            <div>
              <Link href="/welcome" className="group inline-flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-105">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  ResumeAI Pro
                </span>
              </Link>
            </div>

            {/* Middle — Features */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold leading-tight text-white">
                  Score Smarter.<br />
                  Hire Better.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  AI-powered resume scoring that runs entirely on your infrastructure.
                  No data ever leaves your servers.
                </p>
              </motion.div>

              <div className="space-y-3">
                {FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <feature.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{feature.title}</p>
                      <p className="text-xs text-white/60">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom — Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center gap-6 border-t border-white/10 pt-6"
            >
              <div>
                <p className="text-2xl font-bold text-white">6</p>
                <p className="text-xs text-white/50">Score Dimensions</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-white/50">Private & Local</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">&lt;30s</p>
                <p className="text-xs text-white/50">Analysis Time</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="flex flex-1 flex-col bg-background">
          {/* Top nav */}
          <div className="flex items-center justify-between p-6">
            <Link
              href="/welcome"
              className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground">ResumeAI Pro</span>
            </div>

            <Link
              href="/registration/new"
              className="text-sm font-medium text-brand hover:text-brand-700 transition-colors"
            >
              Create account
            </Link>
          </div>

          {/* Form centered */}
          <div className="flex flex-1 items-center justify-center px-4 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[400px]"
            >
              {/* Animated lock icon */}
              <div className="mb-8 flex flex-col items-center">
                <motion.div
                  className="relative mb-4"
                  animate={focused === "password" ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.6, repeat: focused === "password" ? Infinity : 0, repeatDelay: 1 }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
                    <AnimatePresence mode="wait">
                      {focused === "password" ? (
                        <motion.div
                          key="locked"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Lock className="h-7 w-7 text-brand" />
                        </motion.div>
                      ) : focused === "email" ? (
                        <motion.div
                          key="email"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Mail className="h-7 w-7 text-brand" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="sparkles"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sparkles className="h-7 w-7 text-brand" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password typing dots */}
                  {focused === "password" && passwordChars > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
                    >
                      {Math.min(passwordChars, 9)}
                      {passwordChars > 9 ? "+" : ""}
                    </motion.div>
                  )}
                </motion.div>

                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Welcome back
                </h1>
                <p className="mt-1.5 text-sm text-foreground-muted">
                  Sign in to continue to your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                      focused === "email" ? "text-brand" : "text-foreground-muted"
                    }`} />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      required
                      value={data.email_address}
                      onChange={(e) => setData("email_address", e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="you@company.com"
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                    {/* Checkmark when valid email */}
                    <AnimatePresence>
                      {data.email_address.includes("@") && data.email_address.includes(".") && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <CheckCircle className="h-4 w-4 text-success" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <button type="button" className="text-xs font-medium text-brand hover:text-brand-700 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                      focused === "password" ? "text-brand" : "text-foreground-muted"
                    }`} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="Enter your password"
                      className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-10 pr-11 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password strength dots while typing */}
                  <AnimatePresence>
                    {focused === "password" && data.password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <motion.div
                              key={dot}
                              initial={{ scale: 0 }}
                              animate={{ scale: passwordChars >= dot * 2 ? 1 : 0.5 }}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                passwordChars >= dot * 2
                                  ? passwordChars >= 8
                                    ? "bg-success"
                                    : passwordChars >= 6
                                    ? "bg-brand"
                                    : "bg-warning"
                                  : "bg-border"
                              }`}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-foreground-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <p className="text-center text-sm text-foreground-muted">
                Don't have an account?{" "}
                <Link href="/registration/new" className="font-medium text-brand hover:text-brand-700 transition-colors">
                  Create one
                </Link>
              </p>

              {/* Privacy note */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-foreground-muted">
                <Shield className="h-3.5 w-3.5" />
                <span>100% private. Your data never leaves your infrastructure.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
