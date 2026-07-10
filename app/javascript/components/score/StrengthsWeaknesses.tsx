import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle } from "lucide-react"

interface StrengthsWeaknessesProps {
  strengths: string[]
  weaknesses: string[]
}

const listItem = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
}

function StrengthsWeaknesses({ strengths, weaknesses }: StrengthsWeaknessesProps) {
  const hasStrengths = strengths && strengths.length > 0
  const hasWeaknesses = weaknesses && weaknesses.length > 0

  if (!hasStrengths && !hasWeaknesses) return null

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Strengths */}
      {hasStrengths && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[var(--radius-xl)] border border-success/20 bg-success-50/30 p-5"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-success-600">
            <CheckCircle className="h-4 w-4" />
            Strengths ({strengths.length})
          </h3>
          <motion.ul
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.05 }}
            className="space-y-2.5"
          >
            {strengths.map((s, i) => (
              <motion.li
                key={i}
                variants={listItem}
                className="flex items-start gap-2 text-sm text-foreground-secondary"
              >
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                {s}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}

      {/* Weaknesses */}
      {hasWeaknesses && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-[var(--radius-xl)] border border-warning/20 bg-warning-50/30 p-5"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-danger-600">
            <AlertTriangle className="h-4 w-4" />
            Areas for Improvement ({weaknesses.length})
          </h3>
          <motion.ul
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.05 }}
            className="space-y-2.5"
          >
            {weaknesses.map((w, i) => (
              <motion.li
                key={i}
                variants={listItem}
                className="flex items-start gap-2 text-sm text-foreground-secondary"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                {w}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </div>
  )
}

export { StrengthsWeaknesses, type StrengthsWeaknessesProps }
