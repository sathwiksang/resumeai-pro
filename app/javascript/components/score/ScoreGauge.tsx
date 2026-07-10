import { motion } from "framer-motion"
import { scoreRingColor, scoreColor, gradeClass } from "@/lib/utils"
import { useCountUp } from "@/hooks/useCountUp"

interface ScoreGaugeProps {
  score: number
  grade: string
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeConfig = {
  sm: { px: 80, stroke: 5, fontSize: "text-lg", gradeSize: "text-xs px-2 py-0.5" },
  md: { px: 120, stroke: 7, fontSize: "text-2xl", gradeSize: "text-sm px-3 py-1" },
  lg: { px: 200, stroke: 10, fontSize: "text-5xl", gradeSize: "text-lg px-4 py-1.5" },
} as const

function ScoreGauge({ score, grade, animated = true, size = "lg" }: ScoreGaugeProps) {
  const config = sizeConfig[size]
  const radius = (config.px - config.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreRingColor(score)

  const countup = useCountUp({
    end: score,
    duration: animated ? 2500 : 0,
    delay: animated ? 600 : 0,
  })

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG Gauge */}
      <div className="relative" style={{ width: config.px, height: config.px }}>
        <svg width={config.px} height={config.px} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={config.px / 2}
            cy={config.px / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-border"
          />
          {/* Animated score arc */}
          <motion.circle
            cx={config.px / 2}
            cy={config.px / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
            animate={{ strokeDashoffset: offset }}
            transition={animated ? { duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 } : { duration: 0 }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-extrabold tabular-nums ${config.fontSize} ${scoreColor(score)}`}>
            {Math.round(countup.value)}
          </span>
          {size !== "sm" && (
            <span className="text-xs text-foreground-muted">/100</span>
          )}
        </div>
      </div>

      {/* Grade badge */}
      <motion.div
        initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={animated ? {
          delay: 1.5,
          type: "spring",
          stiffness: 300,
          damping: 15,
        } : { duration: 0 }}
        className={`rounded-[var(--radius-lg)] font-extrabold ${config.gradeSize} ${gradeClass(grade)}`}
      >
        {size === "sm" ? grade : `Grade: ${grade}`}
      </motion.div>
    </div>
  )
}

export { ScoreGauge, type ScoreGaugeProps }
