import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  rounded?: "sm" | "md" | "lg" | "full"
}

function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const roundedClass = {
    sm: "rounded-[var(--radius-sm)]",
    md: "rounded-[var(--radius-md)]",
    lg: "rounded-[var(--radius-lg)]",
    full: "rounded-full",
  }

  return (
    <div
      className={cn(
        "skeleton-shimmer",
        roundedClass[rounded],
        className
      )}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable }
