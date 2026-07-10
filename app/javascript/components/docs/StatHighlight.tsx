import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatHighlightProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  duration?: number
  className?: string
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, active])

  return current
}

export function StatHighlight({ value, suffix = "", prefix = "", label, duration = 2000, className }: StatHighlightProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(value, duration, inView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn("text-center", className)}
    >
      <p className="font-display text-4xl font-extrabold text-brand">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-sm text-foreground-secondary">{label}</p>
    </motion.div>
  )
}
