import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"

interface TechStackCardProps {
  icon: ElementType
  name: string
  version: string
  role: string
  accentColor: string
  className?: string
}

export function TechStackCard({ icon: Icon, name, version, role, accentColor, className }: TechStackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={cn(
        "group rounded-[var(--radius-xl)] border border-border bg-surface p-5 transition-all duration-200 hover:border-brand/20 hover:shadow-card",
        className
      )}
    >
      <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)]", accentColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <span className="text-xs text-foreground-muted">{version}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">{role}</p>
    </motion.div>
  )
}
