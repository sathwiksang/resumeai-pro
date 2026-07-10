import { useEffect, useRef, useState } from "react"

const TIMELINE_PHASES = {
  skeleton: 0,
  info: 0,
  gauge: 0,
  countup: 100,
  grade: 100,
  dimensions: 100,
  bars: 150,
  radar: 150,
  keywords: 150,
  recommendations: 200,
  panels: 200,
} as const

export type AnimationPhase = keyof typeof TIMELINE_PHASES

export function useAnimationTimeline(enabled = true) {
  const [activatedPhases, setActivatedPhases] = useState<Set<AnimationPhase>>(
    new Set(enabled ? [] : (Object.keys(TIMELINE_PHASES) as AnimationPhase[]))
  )
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    if (!enabled) {
      setActivatedPhases(new Set(Object.keys(TIMELINE_PHASES) as AnimationPhase[]))
      return
    }

    const timers: number[] = []

    for (const [phase, delay] of Object.entries(TIMELINE_PHASES)) {
      const timer = window.setTimeout(() => {
        setActivatedPhases((prev) => new Set([...prev, phase as AnimationPhase]))
      }, delay)
      timers.push(timer)
    }

    timersRef.current = timers

    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [enabled])

  function isReady(phase: AnimationPhase): boolean {
    return activatedPhases.has(phase)
  }

  function phaseDelay(phase: AnimationPhase): number {
    return TIMELINE_PHASES[phase] / 1000
  }

  return { isReady, phaseDelay, phases: TIMELINE_PHASES }
}
