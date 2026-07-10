import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-hover shadow-sm active:shadow-none",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-surface-elevated shadow-sm",
  ghost:
    "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground",
  danger:
    "bg-danger text-white hover:bg-red-700 shadow-sm",
  success:
    "bg-success text-white hover:bg-emerald-700 shadow-sm",
  link:
    "text-brand hover:text-brand-hover underline-offset-4 hover:underline p-0 h-auto",
} as const

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-base gap-2.5 rounded-[var(--radius-md)]",
  xl: "h-14 px-8 text-lg gap-3 rounded-[var(--radius-lg)]",
  icon: "h-10 w-10 rounded-[var(--radius-md)]",
  "icon-sm": "h-8 w-8 rounded-[var(--radius-sm)]",
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-[var(--duration-fast)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
export { Button, type ButtonProps }
