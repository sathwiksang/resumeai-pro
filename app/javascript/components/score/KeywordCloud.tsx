import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Minus, ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import type { KeywordMatch } from "@/types"

interface KeywordCloudProps {
  matched: KeywordMatch[]
  partial: KeywordMatch[]
  missing: string[]
}

function KeywordSection({
  title,
  count,
  variant,
  defaultOpen = true,
  children,
}: {
  title: string
  count: number
  variant: "success" | "warning" | "danger"
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-2 flex w-full items-center gap-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-foreground-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-foreground-muted" />
        )}
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <Badge variant={variant} size="sm">{count}</Badge>
      </button>
      {open && children}
    </div>
  )
}

function KeywordCloud({ matched, partial, missing }: KeywordCloudProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Matched */}
      {matched.length > 0 && (
        <KeywordSection title="Matched" count={matched.length} variant="success">
          <div className="flex flex-wrap gap-2">
            {matched.map((kw) => (
              <div
                key={kw.term}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600 ring-1 ring-inset ring-success/20"
              >
                <Check className="h-3 w-3" />
                <span>{kw.term}</span>
                {kw.location && (
                  <span className="text-success-500">({kw.location})</span>
                )}
                {kw.weight != null && kw.weight > 0 && (
                  <span className="ml-0.5 text-success-400">{kw.weight.toFixed(1)}</span>
                )}
              </div>
            ))}
          </div>
        </KeywordSection>
      )}

      {/* Partial */}
      {partial.length > 0 && (
        <KeywordSection title="Partial Match" count={partial.length} variant="warning" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {partial.map((kw) => (
              <div
                key={kw.term}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-warning-50 px-2.5 py-1 text-xs font-medium text-warning-600 ring-1 ring-inset ring-warning/20"
              >
                <Minus className="h-3 w-3" />
                <span>{kw.term}</span>
                {kw.similarity != null && kw.similarity > 0 && (
                  <span className="ml-0.5 text-warning-400">
                    {(kw.similarity * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </KeywordSection>
      )}

      {/* Missing */}
      {missing.length > 0 && (
        <KeywordSection title="Missing" count={missing.length} variant="danger" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {missing.map((term) => (
              <div
                key={term}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger-600 ring-1 ring-inset ring-danger/20"
              >
                <X className="h-3 w-3" />
                <span>{term}</span>
              </div>
            ))}
          </div>
        </KeywordSection>
      )}
    </motion.div>
  )
}

export { KeywordCloud, type KeywordCloudProps }
