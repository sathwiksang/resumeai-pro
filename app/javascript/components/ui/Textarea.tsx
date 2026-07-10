import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-[var(--radius-md)] border bg-surface px-3 py-2",
            "text-sm text-foreground placeholder:text-foreground-muted",
            "transition-colors duration-[var(--duration-fast)]",
            "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {hint && !error && <p className="text-sm text-foreground-muted">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
export { Textarea, type TextareaProps }
