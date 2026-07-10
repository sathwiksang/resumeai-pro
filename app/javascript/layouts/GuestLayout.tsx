import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { FlashMessages } from "@/components/FlashMessages"
import { Shield } from "lucide-react"

interface GuestLayoutProps {
  children: ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <FlashMessages />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-xl)] bg-brand text-white shadow-glow">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">ResumeAI Pro</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Score Smarter. Hire Better. 100% Private.
          </p>
        </div>

        {children}
      </motion.div>
    </div>
  )
}
