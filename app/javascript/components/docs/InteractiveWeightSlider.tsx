import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WeightSegment {
  label: string
  percentage: number
  color: string
  bgColor: string
  description: string
}

interface InteractiveWeightSliderProps {
  segments: WeightSegment[]
  className?: string
}

export function InteractiveWeightSlider({ segments, className }: InteractiveWeightSliderProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Bar */}
      <div className="flex h-12 overflow-hidden rounded-[var(--radius-lg)] border border-border">
        {segments.map((segment, i) => (
          <motion.div
            key={segment.label}
            initial={{ width: 0 }}
            whileInView={{ width: `${segment.percentage}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "relative flex items-center justify-center cursor-pointer transition-opacity duration-200",
              segment.bgColor,
              hoveredIndex !== null && hoveredIndex !== i && "opacity-60"
            )}
          >
            <span className={cn("text-xs font-bold", segment.color)}>
              {segment.percentage}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between gap-2">
        {segments.map((segment, i) => (
          <motion.div
            key={segment.label}
            className={cn(
              "flex-1 rounded-[var(--radius-md)] border p-3 text-center transition-all duration-200",
              hoveredIndex === i
                ? "border-brand/30 bg-brand-50/30 shadow-card"
                : "border-border bg-surface"
            )}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <p className={cn("text-xs font-bold", segment.color)}>{segment.label}</p>
            <p className="mt-1 text-[11px] text-foreground-muted">{segment.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
