import { usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertTriangle } from "lucide-react"
import type { SharedProps } from "@/types"

export function FlashMessages() {
  const { flash } = usePage<SharedProps>().props
  const [visible, setVisible] = useState({ notice: false, alert: false })

  useEffect(() => {
    if (flash.notice) setVisible((v) => ({ ...v, notice: true }))
    if (flash.alert) setVisible((v) => ({ ...v, alert: true }))

    const timer = setTimeout(() => {
      setVisible({ notice: false, alert: false })
    }, 5000)

    return () => clearTimeout(timer)
  }, [flash.notice, flash.alert])

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {visible.notice && flash.notice && (
          <Toast
            key="notice"
            type="success"
            message={flash.notice}
            onClose={() => setVisible((v) => ({ ...v, notice: false }))}
          />
        )}
        {visible.alert && flash.alert && (
          <Toast
            key="alert"
            type="warning"
            message={flash.alert}
            onClose={() => setVisible((v) => ({ ...v, alert: false }))}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "warning"
  message: string
  onClose: () => void
}) {
  const Icon = type === "success" ? CheckCircle : AlertTriangle
  const colors =
    type === "success"
      ? "bg-success-50 border-success/20 text-success-600"
      : "bg-warning-50 border-warning/20 text-warning-600"

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 shadow-lg ${colors}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
