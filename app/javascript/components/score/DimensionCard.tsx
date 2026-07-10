import { motion } from "framer-motion"
import { Info } from "lucide-react"
import type { ElementType } from "react"
import { scoreColor, scoreBgColor } from "@/lib/utils"
import { Progress } from "@/components/ui/Progress"
import { Tooltip } from "@/components/ui/Tooltip"

interface DimensionCardProps {
  icon: ElementType
  label: string
  score: number
  description: string
  delay?: number
}

function DimensionCard({ icon: Icon, label, score, description, delay = 0 }: DimensionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 transition-shadow hover:shadow-card"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] ${scoreBgColor(score)}`}>
            <Icon className={`h-4 w-4 ${scoreColor(score)}`} />
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold tabular-nums ${scoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
          <Tooltip content={description} position="left">
            <Info className="h-3.5 w-3.5 cursor-help text-foreground-muted" />
          </Tooltip>
        </div>
      </div>
      <Progress value={score} max={100} size="sm" animated />
    </motion.div>
  )
}

export { DimensionCard, type DimensionCardProps }
