import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface RadarChartProps {
  scores: {
    keyword: number
    semantic: number
    skills: number
    experience: number
    education: number
    format: number
  }
  maxScore?: number
  className?: string
}

const DIMENSIONS = [
  { key: "keyword", label: "Keywords", color: "#3B82F6", description: "Resume keyword matching" },
  { key: "semantic", label: "Semantic", color: "#8B5CF6", description: "Contextual relevance" },
  { key: "skills", label: "Skills", color: "#06B6D4", description: "Technical & soft skills" },
  { key: "experience", label: "Experience", color: "#10B981", description: "Work experience fit" },
  { key: "education", label: "Education", color: "#F59E0B", description: "Education alignment" },
  { key: "format", label: "Format", color: "#EF4444", description: "Structure & quality" },
] as const

const CX = 200
const CY = 200
const R = 140
const LEVELS = 5

function polarToXY(index: number, total: number, radius: number): [number, number] {
  const angle = ((Math.PI * 2) / total) * index - Math.PI / 2
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]
}

function buildPolygonPath(values: number[], max: number): string {
  const n = values.length
  const points = values.map((v, i) => {
    const ratio = Math.min(v / max, 1)
    const [x, y] = polarToXY(i, n, R * ratio)
    return `${x},${y}`
  })
  return `M${points.join("L")}Z`
}

function buildGridPolygon(radius: number): string {
  const n = DIMENSIONS.length
  const points = Array.from({ length: n }, (_, i) => {
    const [x, y] = polarToXY(i, n, radius)
    return `${x},${y}`
  })
  return `M${points.join("L")}Z`
}

function RadarChart({ scores, maxScore = 100, className }: RadarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const values = DIMENSIONS.map((d) => scores[d.key as keyof typeof scores] || 0)
  const n = DIMENSIONS.length
  const avg = values.reduce((a, b) => a + b, 0) / n

  const dataPath = buildPolygonPath(values, maxScore)

  // Score quality label
  const qualityLabel = avg >= 85 ? "Excellent" : avg >= 70 ? "Good" : avg >= 55 ? "Fair" : "Needs Work"
  const qualityColor = avg >= 85 ? "#059669" : avg >= 70 ? "#2563EB" : avg >= 55 ? "#D97706" : "#DC2626"

  return (
    <div className={`relative ${className || ""}`}>
      {/* Chart container */}
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
        {/* SVG Radar */}
        <div className="relative w-full max-w-[420px] shrink-0">
          <svg
            viewBox="0 0 400 400"
            className="w-full"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              {/* Gradient fill for score area */}
              <radialGradient id="scoreGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.08" />
              </radialGradient>

              {/* Glow filter */}
              <filter id="scoreGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Dot glow */}
              <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Per-dimension gradients for the axis lines on hover */}
              {DIMENSIONS.map((d, i) => (
                <linearGradient key={d.key} id={`axisGrad-${i}`} x1="50%" y1="50%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={d.color} stopOpacity="0" />
                  <stop offset="100%" stopColor={d.color} stopOpacity="0.6" />
                </linearGradient>
              ))}
            </defs>

            {/* Background circle pulse */}
            <circle cx={CX} cy={CY} r={R + 20} fill="none" className="stroke-brand/5" strokeWidth={30} />

            {/* Grid levels */}
            {Array.from({ length: LEVELS }, (_, i) => {
              const levelR = ((i + 1) / LEVELS) * R
              return (
                <path
                  key={i}
                  d={buildGridPolygon(levelR)}
                  fill="none"
                  className={i === LEVELS - 1 ? "stroke-border" : "stroke-border/50"}
                  strokeWidth={i === LEVELS - 1 ? 1.2 : 0.6}
                />
              )
            })}

            {/* Level labels (right side) */}
            {Array.from({ length: LEVELS }, (_, i) => {
              const pct = ((i + 1) / LEVELS) * 100
              const levelR = ((i + 1) / LEVELS) * R
              return (
                <text
                  key={i}
                  x={CX + 8}
                  y={CY - levelR + 4}
                  className="fill-foreground-muted/50 text-[9px]"
                >
                  {pct}
                </text>
              )
            })}

            {/* Axis lines */}
            {DIMENSIONS.map((d, i) => {
              const [x, y] = polarToXY(i, n, R)
              const isHovered = hoveredIdx === i
              return (
                <line
                  key={d.key}
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke={isHovered ? d.color : "var(--color-border)"}
                  strokeWidth={isHovered ? 1.5 : 0.6}
                  strokeOpacity={isHovered ? 0.8 : 0.5}
                  style={{ transition: "all 0.2s ease" }}
                />
              )
            })}

            {/* Score fill area */}
            <motion.path
              d={buildPolygonPath(Array(n).fill(0), maxScore)}
              animate={{ d: dataPath }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              fill="url(#scoreGradient)"
              stroke="url(#scoreStroke)"
              strokeWidth={0}
              filter="url(#scoreGlow)"
            />

            {/* Score outline */}
            <motion.path
              d={buildPolygonPath(Array(n).fill(0), maxScore)}
              animate={{ d: dataPath }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeOpacity={0.8}
            />

            {/* Interactive data points */}
            {values.map((v, i) => {
              const ratio = Math.min(v / maxScore, 1)
              const [x, y] = polarToXY(i, n, R * ratio)
              const isHovered = hoveredIdx === i
              const dim = DIMENSIONS[i]

              return (
                <g key={dim.key}>
                  {/* Invisible hit area for hover */}
                  <circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />

                  {/* Outer glow ring on hover */}
                  {isHovered && (
                    <motion.circle
                      initial={{ r: 4, opacity: 0 }}
                      animate={{ r: 12, opacity: 0.2 }}
                      cx={x}
                      cy={y}
                      fill={dim.color}
                    />
                  )}

                  {/* Data dot */}
                  <motion.circle
                    cx={CX}
                    cy={CY}
                    animate={{
                      cx: x,
                      cy: y,
                      r: isHovered ? 6 : 4.5,
                    }}
                    transition={{
                      cx: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                      cy: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                      r: { duration: 0.15 },
                    }}
                    fill={dim.color}
                    stroke="white"
                    strokeWidth={2.5}
                    filter={isHovered ? "url(#dotGlow)" : undefined}
                    style={{ transition: "filter 0.2s ease" }}
                  />

                  {/* Score value on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <rect
                          x={x - 22}
                          y={y - 28}
                          width={44}
                          height={20}
                          rx={6}
                          fill={dim.color}
                          opacity={0.9}
                        />
                        <text
                          x={x}
                          y={y - 15}
                          textAnchor="middle"
                          fill="white"
                          className="text-[11px] font-bold"
                        >
                          {v.toFixed(1)}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              )
            })}

            {/* Axis labels */}
            {DIMENSIONS.map((d, i) => {
              const [lx, ly] = polarToXY(i, n, R + 30)
              const isHovered = hoveredIdx === i
              let textAnchor: "start" | "middle" | "end" = "middle"
              let dx = 0
              if (lx < CX - 20) { textAnchor = "end"; dx = -2 }
              else if (lx > CX + 20) { textAnchor = "start"; dx = 2 }

              return (
                <g key={d.key} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                  <text
                    x={lx + dx}
                    y={ly}
                    textAnchor={textAnchor}
                    fill={isHovered ? d.color : "var(--color-foreground-secondary)"}
                    className="text-[11px] font-semibold"
                    style={{ transition: "fill 0.2s ease" }}
                  >
                    {d.label}
                  </text>
                  <text
                    x={lx + dx}
                    y={ly + 13}
                    textAnchor={textAnchor}
                    fill={isHovered ? d.color : "var(--color-foreground-muted)"}
                    className="text-[10px] tabular-nums"
                    style={{ transition: "fill 0.2s ease" }}
                  >
                    {(scores[d.key as keyof typeof scores] || 0).toFixed(1)}%
                  </text>
                </g>
              )
            })}

            {/* Center content */}
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <circle cx={CX} cy={CY} r={28} className="fill-surface" />
              <circle cx={CX} cy={CY} r={28} fill="none" className="stroke-border" strokeWidth={1} />
              <text
                x={CX}
                y={CY - 3}
                textAnchor="middle"
                className="text-[18px] font-extrabold"
                fill={qualityColor}
              >
                {Math.round(avg)}
              </text>
              <text
                x={CX}
                y={CY + 11}
                textAnchor="middle"
                className="fill-foreground-muted text-[8px] font-medium uppercase tracking-wider"
              >
                AVG
              </text>
            </motion.g>
          </svg>
        </div>

        {/* Side panel — dimension breakdown */}
        <div className="w-full space-y-2.5 lg:max-w-[220px]">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Overall</p>
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: qualityColor }}>
              {avg.toFixed(1)}%
            </p>
            <p className="text-xs font-medium" style={{ color: qualityColor }}>{qualityLabel}</p>
          </div>

          {DIMENSIONS.map((d, i) => {
            const val = values[i]
            const pct = Math.min((val / maxScore) * 100, 100)
            const isHovered = hoveredIdx === i

            return (
              <div
                key={d.key}
                className={`rounded-lg border px-3 py-2 transition-all duration-150 cursor-pointer ${
                  isHovered
                    ? "border-brand/30 bg-brand-50/50 shadow-sm"
                    : "border-transparent bg-surface-elevated/50"
                }`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-xs font-medium text-foreground-secondary">{d.label}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-foreground">{val.toFixed(1)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border/40">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { RadarChart, type RadarChartProps }
