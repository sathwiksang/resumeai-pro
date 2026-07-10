import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
  question: string
  answer: string
  defaultOpen?: boolean
  className?: string
}

export function AccordionItem({ question, answer, defaultOpen = false, className }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn("border-b border-border", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="pr-4 text-sm font-semibold text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-foreground-secondary">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
