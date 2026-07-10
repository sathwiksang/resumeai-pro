import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Clock, Zap, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/types"

interface RecommendationListProps {
  recommendations: Recommendation[]
}

const priorityBorder: Record<string, string> = {
  critical: "border-l-danger",
  high: "border-l-warning-500",
  medium: "border-l-warning-300",
  low: "border-l-brand-400",
}

const priorityVariant: Record<string, "danger" | "warning" | "default" | "info"> = {
  critical: "danger",
  high: "warning",
  medium: "default",
  low: "info",
}

const effortIcon: Record<string, React.ElementType> = {
  quick_fix: Zap,
  moderate: Wrench,
  significant: Clock,
}

const effortLabel: Record<string, string> = {
  quick_fix: "Quick Fix",
  moderate: "Moderate",
  significant: "Significant",
}

function ImpactDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`Impact: ${score}/10`}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < score ? "bg-brand" : "bg-border"
          )}
        />
      ))}
    </div>
  )
}

function RecommendationItem({ rec, index }: { rec: Recommendation; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const EffortIcon = effortIcon[rec.estimated_effort] || Wrench

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "rounded-[var(--radius-lg)] border border-border border-l-4 bg-surface overflow-hidden",
        priorityBorder[rec.priority] || "border-l-border"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={priorityVariant[rec.priority] || "default"} size="sm">
              {rec.priority}
            </Badge>
            <Badge variant="muted" size="sm">{rec.category}</Badge>
          </div>
          <p className="font-medium text-foreground">{rec.title}</p>
          <p className="mt-1 text-sm text-foreground-secondary">{rec.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-foreground-muted">
              <EffortIcon className="h-3 w-3" />
              {effortLabel[rec.estimated_effort] || rec.estimated_effort}
            </div>
            {rec.impact_score > 0 && <ImpactDots score={rec.impact_score} />}
          </div>
        </div>
        {rec.action_items?.length > 0 && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-foreground-muted" />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {expanded && rec.action_items?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Action Items
              </p>
              <ul className="space-y-1.5">
                {rec.action_items.map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground-secondary"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function RecommendationList({ recommendations }: RecommendationListProps) {
  const sorted = [...recommendations].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
  })

  return (
    <div className="space-y-3">
      {sorted.map((rec, i) => (
        <RecommendationItem key={`${rec.category}-${rec.title}-${i}`} rec={rec} index={i} />
      ))}
    </div>
  )
}

export { RecommendationList, type RecommendationListProps }
