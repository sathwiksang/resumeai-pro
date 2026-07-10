import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"

export interface FlowNode {
  icon: ElementType
  label: string
  description: string
  color: string
}

interface FlowDiagramProps {
  nodes: FlowNode[]
  className?: string
  direction?: "horizontal" | "vertical"
}

export function FlowDiagram({ nodes, className, direction = "horizontal" }: FlowDiagramProps) {
  const isVertical = direction === "vertical"

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isVertical ? "flex-col" : "flex-col lg:flex-row",
        className
      )}
    >
      {nodes.map((node, i) => {
        const Icon = node.icon
        return (
          <div
            key={node.label}
            className={cn(
              "flex items-center gap-2",
              isVertical ? "flex-col" : "flex-col lg:flex-row"
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-5 text-center transition-all duration-200 hover:border-brand/30 hover:shadow-card min-w-[140px]"
            >
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]", node.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">{node.label}</p>
              <p className="text-xs leading-relaxed text-foreground-muted max-w-[160px]">{node.description}</p>
            </motion.div>
            {/* Connector */}
            {i < nodes.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                className={cn(
                  "flex items-center justify-center text-foreground-muted",
                  isVertical ? "h-6" : "h-6 lg:h-auto lg:w-6"
                )}
              >
                <svg
                  className={cn(
                    "text-brand/40",
                    isVertical ? "h-6 w-4" : "h-4 w-6 rotate-90 lg:rotate-0"
                  )}
                  viewBox="0 0 24 16"
                  fill="none"
                >
                  <path d="M0 8h20m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </div>
        )
      })}
    </div>
  )
}
