import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"

export interface PipelineStage {
  icon: ElementType
  label: string
  color: string
  inputs: string[]
  processing: string
  outputs: string[]
}

interface ScoringPipelineDiagramProps {
  stages: PipelineStage[]
  className?: string
}

export function ScoringPipelineDiagram({ stages, className }: ScoringPipelineDiagramProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <div className={cn("space-y-3", className)}>
      {stages.map((stage, i) => {
        const Icon = stage.icon
        const isExpanded = expandedIndex === i

        return (
          <motion.div
            key={stage.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className={cn(
                "flex w-full items-center gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition-all duration-200",
                isExpanded
                  ? "border-brand/30 bg-brand-50/30 shadow-card"
                  : "border-border bg-surface hover:border-brand/20 hover:shadow-card"
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]", stage.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Stage {i + 1}: {stage.label}
                </p>
                <p className="text-xs text-foreground-muted">{stage.processing}</p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 grid grid-cols-1 gap-3 rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-4 sm:grid-cols-3">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-success-600">Inputs</p>
                      <ul className="space-y-1">
                        {stage.inputs.map((input) => (
                          <li key={input} className="text-xs text-foreground-secondary">&bull; {input}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">Processing</p>
                      <p className="text-xs text-foreground-secondary">{stage.processing}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warning-600">Outputs</p>
                      <ul className="space-y-1">
                        {stage.outputs.map((output) => (
                          <li key={output} className="text-xs text-foreground-secondary">&bull; {output}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
