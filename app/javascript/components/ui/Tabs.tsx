import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"

interface Tab {
  key: string
  label: string
  icon?: ElementType
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
  layoutId?: string
}

function Tabs({ tabs, activeTab, onChange, className, layoutId = "tab-underline" }: TabsProps) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "text-brand"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-x-0 -bottom-px h-0.5 bg-brand"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export { Tabs, type TabsProps, type Tab }
