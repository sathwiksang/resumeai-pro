import { Link, usePage, router } from "@inertiajs/react"
import { Search, Bell, LogOut, User, ChevronRight, Sun, Moon, BarChart3, AlertCircle, Loader2 } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Avatar } from "@/components/ui/Avatar"
import { cn, formatDate } from "@/lib/utils"
import { useDarkMode } from "@/hooks/useDarkMode"
import type { SharedProps } from "@/types"

interface TopBarProps {
  sidebarCollapsed: boolean
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  const { auth, notifications } = usePage<SharedProps>().props
  const user = auth.user
  const org = auth.organization
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const { isDark, toggle: toggleDark } = useDarkMode()

  // Track read notifications in localStorage
  const [readIds, setReadIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("readNotificationIds") || "[]")
    } catch { return [] }
  })
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length

  function markAllRead() {
    const allIds = notifications.map((n) => n.id)
    setReadIds(allIds)
    localStorage.setItem("readNotificationIds", JSON.stringify(allIds))
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Cmd+K / Ctrl+K to focus search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      searchRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 flex h-16 items-center border-b border-border bg-surface/80 backdrop-blur-sm px-6 transition-all duration-200",
        sidebarCollapsed ? "left-[68px]" : "left-[260px]"
      )}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-foreground-muted">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {org?.name || "ResumeAI Pro"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Dashboard</span>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search resumes, scores..."
            className="h-9 w-64 rounded-[var(--radius-md)] border border-border bg-surface-elevated pl-9 pr-14 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono text-foreground-muted">
            ⌘K
          </kbd>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 rounded-[var(--radius-lg)] border border-border bg-surface shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand hover:text-brand/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto h-6 w-6 text-foreground-muted" />
                    <p className="mt-2 text-sm text-foreground-muted">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        setNotifOpen(false)
                        if (!readIds.includes(notif.id)) {
                          const updated = [...readIds, notif.id]
                          setReadIds(updated)
                          localStorage.setItem("readNotificationIds", JSON.stringify(updated))
                        }
                        router.visit(`/resume_scores/${notif.score_id}`)
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated",
                        !readIds.includes(notif.id) && "bg-brand-50/50"
                      )}
                    >
                      <div className="mt-0.5">
                        {notif.type === "error" ? (
                          <AlertCircle className="h-4 w-4 text-danger" />
                        ) : notif.status === "completed" ? (
                          <BarChart3 className="h-4 w-4 text-success" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin text-warning" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="mt-0.5 text-xs text-foreground-muted">
                          {formatDate(notif.created_at)}
                        </p>
                      </div>
                      {notif.overall_score != null && notif.status === "completed" && (
                        <span className="shrink-0 text-sm font-bold text-foreground">
                          {notif.overall_score}%
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-surface-elevated"
            >
              <Avatar
                firstName={user.first_name}
                lastName={user.last_name}
                src={user.avatar_url}
                size="sm"
              />
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-foreground-muted capitalize">{user.role}</p>
              </div>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-[var(--radius-lg)] border border-border bg-surface p-1.5 shadow-lg">
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm text-foreground-secondary hover:bg-surface-elevated hover:text-foreground transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile & Settings
                </Link>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    router.delete("/session")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm text-danger hover:bg-danger-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
