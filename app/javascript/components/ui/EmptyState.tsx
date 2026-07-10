import { Link } from "@inertiajs/react"
import { Button } from "./Button"

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, actionOnClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-foreground-secondary">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && actionOnClick && (
        <Button className="mt-6" onClick={actionOnClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
