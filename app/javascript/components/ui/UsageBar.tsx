
export interface UsageBarProps {
  used: number
  limit: number
  label: string
  className?: string
}

export function UsageBar({ used, limit, label, className = "" }: UsageBarProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const color =
    percentage >= 90 ? "bg-red-500" : percentage >= 80 ? "bg-yellow-500" : "bg-indigo-500"

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-900 dark:text-white">
          {used} / {isUnlimited ? "\u221e" : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-full" />
        </div>
      )}
    </div>
  )
}
