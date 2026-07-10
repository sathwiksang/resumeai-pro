import { Link, usePage } from "@inertiajs/react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Zap,
  Layers,
  GitCompare,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Mail,
  HelpCircle,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SharedProps } from "@/types"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Resumes", href: "/resumes", icon: FileText },
  { label: "Job Descriptions", href: "/job_descriptions", icon: Briefcase },
  { label: "Score Analysis", href: "/resume_scores", icon: BarChart3 },
]

const toolsNav: NavItem[] = [
  { label: "Quick Score", href: "/quick-score", icon: Zap },
  { label: "Bulk Analysis", href: "/resumes", icon: Layers },
  { label: "Compare Resumes", href: "/compare", icon: GitCompare },
]

const adminNav: NavItem[] = [
  { label: "Team Members", href: "/admin/users", icon: Users },
  { label: "Invitations", href: "/admin/invitations", icon: Mail },
  { label: "Billing & Plans", href: "/admin/billing", icon: CreditCard },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const helpNav: NavItem[] = [
  { label: "Help Center", href: "/help", icon: HelpCircle },
  { label: "Getting Started", href: "/help/getting-started", icon: BookOpen },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { auth, llm_model } = usePage<SharedProps>().props
  const modelLabel = (llm_model as string) || "Local model"
  const isAdmin = auth.user?.role === "admin"
  const isRecruiter = auth.user?.role === "recruiter" || isAdmin

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-surface"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand text-white">
          <Shield className="h-5 w-5" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <span className="font-display text-sm font-bold tracking-tight">ResumeAI</span>
            <span className="text-xs text-foreground-muted">Pro</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavSection label="MAIN" collapsed={collapsed} items={mainNav} />
        {isRecruiter && (
          <NavSection label="TOOLS" collapsed={collapsed} items={toolsNav} />
        )}
        {isRecruiter && (
          <NavSection label="ADMIN" collapsed={collapsed} items={isAdmin ? adminNav : adminNav.filter(i => i.href === "/admin/invitations")} />
        )}
        <NavSection label="HELP" collapsed={collapsed} items={helpNav} />
      </nav>

      {/* LLM Status Footer */}
      {!collapsed && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Local AI</span>
              <span className="text-xs text-foreground-muted">{modelLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-border text-foreground-muted transition-colors hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </motion.aside>
  )
}

function NavSection({
  label,
  collapsed,
  items,
}: {
  label: string
  collapsed: boolean
  items: NavItem[]
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink key={item.href + item.label} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  )
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { url } = usePage()
  const isActive = url.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all duration-[var(--duration-fast)]",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-brand-50 text-brand shadow-sm"
          : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          isActive ? "text-brand" : "text-foreground-muted group-hover:text-foreground-secondary"
        )}
      />
      {!collapsed && <span>{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs text-white">
          {item.badge}
        </span>
      )}
    </Link>
  )
}
