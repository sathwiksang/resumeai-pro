import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-foreground-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-[var(--radius-md)] border bg-surface px-3 py-2",
              "text-sm text-foreground placeholder:text-foreground-muted",
              "transition-colors duration-[var(--duration-fast)]",
              "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error
                ? "border-danger focus:border-danger focus:ring-danger/20"
                : "border-border",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {hint && !error && <p className="text-sm text-foreground-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
export { Input, type InputProps }
