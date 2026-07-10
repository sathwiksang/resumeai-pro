import { useEffect, useRef, useState } from "react"

// ease-out-expo: fast start, decelerating finish
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

interface UseCountUpOptions {
  end: number
  duration?: number
  delay?: number
  decimals?: number
}

interface UseCountUpResult {
  value: number
  isComplete: boolean
}

export function useCountUp({
  end,
  duration = 2500,
  delay = 0,
  decimals = 0,
}: UseCountUpOptions): UseCountUpResult {
  const [value, setValue] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (end === 0) {
      setValue(0)
      setIsComplete(true)
      return
    }

    const timeout = setTimeout(() => {
      const startTime = performance.now()

      function tick(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutExpo(progress)
        const current = eased * end

        const factor = Math.pow(10, decimals)
        setValue(Math.round(current * factor) / factor)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setValue(end)
          setIsComplete(true)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, delay, decimals])

  return { value, isComplete }
}
