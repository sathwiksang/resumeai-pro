import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"

interface ArchLayer {
  label: string
  color: string
  textColor: string
  items: { icon: ElementType; name: string }[]
}

interface ArchitectureDiagramProps {
  layers: ArchLayer[]
  className?: string
}

export function ArchitectureDiagram({ layers, className }: ArchitectureDiagramProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {layers.map((layer, i) => (
        <motion.div
          key={layer.label}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.12 }}
        >
          <div className={cn("rounded-[var(--radius-lg)] border border-border overflow-hidden", layer.color)}>
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-black/5">
              <span className={cn("text-xs font-bold uppercase tracking-widest", layer.textColor)}>
                {layer.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              {layer.items.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] bg-white/60 dark:bg-black/10 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </div>
                )
              })}
            </div>
          </div>
          {/* Connector */}
          {i < layers.length - 1 && (
            <div className="flex justify-center py-1">
              <svg className="h-4 w-4 text-foreground-muted/40" viewBox="0 0 16 16" fill="none">
                <path d="M8 0v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
