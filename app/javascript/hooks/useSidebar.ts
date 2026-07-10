import { useState, useCallback, useEffect } from "react"

const SIDEBAR_KEY = "resumeai-sidebar-collapsed"

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(SIDEBAR_KEY) === "true"
  })

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }, [])

  // Collapse on mobile by default
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)")
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setCollapsed(true)
    }
    if (mq.matches) setCollapsed(true)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return { collapsed, toggle }
}
