import { cn, scoreRingColor } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  animated?: boolean
  className?: string
}

function Progress({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  animated = true,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const color = scoreRingColor(percentage)

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("flex-1 overflow-hidden rounded-full bg-surface-elevated", heights[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all",
            animated && "duration-[var(--duration-progress-bar)] ease-[var(--ease-spring)]"
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium tabular-nums text-foreground-secondary" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

export { Progress, type ProgressProps }
