import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: ReactNode
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

const arrowStyles = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-foreground border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-foreground border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-foreground border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-foreground border-y-transparent border-l-transparent",
}

function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-[var(--radius-md)] bg-foreground px-2.5 py-1.5 text-xs font-medium text-surface shadow-lg",
            positionStyles[position]
          )}
        >
          {content}
          <div
            className={cn("absolute h-0 w-0 border-4", arrowStyles[position])}
          />
        </div>
      )}
    </div>
  )
}

export { Tooltip, type TooltipProps }
