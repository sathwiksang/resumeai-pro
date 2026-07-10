import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-brand-50 text-brand-700 ring-brand-500/20",
  brand: "bg-brand text-white ring-brand/20",
  success: "bg-success-50 text-success-600 ring-success/20",
  warning: "bg-warning-50 text-warning-600 ring-warning/20",
  danger: "bg-danger-50 text-danger-600 ring-danger/20",
  info: "bg-info-light text-info ring-info/20",
  muted: "bg-surface-elevated text-foreground-secondary ring-border/40",
} as const

const sizes = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1 text-sm",
} as const

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  dot?: boolean
}

function Badge({ className, variant = "default", size = "md", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-full)] ring-1 ring-inset",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  )
}

export { Badge, type BadgeProps }
