import { cn } from "@/lib/utils"

interface CodeBlockProps {
  title?: string
  language?: string
  children: string
  className?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ title, language, children, className, showLineNumbers = true }: CodeBlockProps) {
  const lines = children.trimEnd().split("\n")

  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-lg)] border border-border bg-[#1e1e2e]", className)}>
      {title && (
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/60" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <span className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <span className="ml-2 text-xs font-medium text-white/50">{title}</span>
          {language && (
            <span className="ml-auto rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/40 uppercase">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-sm leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="mr-4 inline-block w-8 select-none text-right text-white/20">
                  {i + 1}
                </span>
              )}
              <code className="text-white/85">{line}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
