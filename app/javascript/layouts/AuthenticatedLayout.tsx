import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/Sidebar"
import { TopBar } from "@/components/TopBar"
import { FlashMessages } from "@/components/FlashMessages"
import { useSidebar } from "@/hooks/useSidebar"
import { cn } from "@/lib/utils"

interface AuthenticatedLayoutProps {
  children: ReactNode
  title?: string
}

export function AuthenticatedLayout({ children, title }: AuthenticatedLayoutProps) {
  const { collapsed, toggle } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <FlashMessages />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <TopBar sidebarCollapsed={collapsed} />

      <main
        className={cn(
          "pt-16 transition-all duration-200",
          collapsed ? "pl-[68px]" : "pl-[260px]"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-7xl px-6 py-8"
        >
          {title && (
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            </div>
          )}
          {children}
        </motion.div>
      </main>
    </div>
  )
}
