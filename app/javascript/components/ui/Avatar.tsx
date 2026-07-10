import { cn, initials } from "@/lib/utils"

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const

interface AvatarProps {
  src?: string | null
  firstName: string
  lastName: string
  size?: keyof typeof sizes
  className?: string
}

function Avatar({ src, firstName, lastName, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn(
          "rounded-full object-cover ring-2 ring-border",
          sizes[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-brand-100 font-display font-semibold text-brand-700",
        sizes[size],
        className
      )}
    >
      {initials(firstName, lastName)}
    </div>
  )
}

export { Avatar, type AvatarProps }
