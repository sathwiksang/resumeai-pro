import { useState } from "react"
import { Link } from "@inertiajs/react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, ArrowRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

interface MarketingLayoutProps {
  children: React.ReactNode
  activeNav?: string
}

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Features", href: "/features" },
  { label: "Architecture", href: "/architecture" },
  { label: "Docs", href: "/docs" },
  { label: "FAQ", href: "/faq" },
]

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/welcome#pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Architecture", href: "/architecture" },
      { label: "Getting Started", href: "/help/getting-started" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
]

export function MarketingLayout({ children, activeNav }: MarketingLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/welcome" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-brand text-white shadow-glow">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-display text-base font-bold tracking-tight">ResumeAI Pro</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                    activeNav === link.label
                      ? "bg-brand-50 text-brand"
                      : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <Link href="/session/new">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/registration/new">
                <Button size="sm" className="gap-1.5">
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-foreground-secondary hover:bg-surface-elevated md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border bg-surface md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
                      activeNav === link.label
                        ? "bg-brand-50 text-brand"
                        : "text-foreground-secondary hover:bg-surface-elevated"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                  <Link href="/session/new">
                    <Button variant="secondary" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/registration/new">
                    <Button className="w-full gap-1.5">
                      Get Started
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-elevated/50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-sm font-semibold text-foreground">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-brand text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-display text-sm font-bold">ResumeAI Pro</span>
            </div>
            <p className="text-xs text-foreground-muted">
              &copy; {new Date().getFullYear()} ResumeAI Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
