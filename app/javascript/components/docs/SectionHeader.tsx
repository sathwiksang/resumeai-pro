import { motion } from "framer-motion"
import { Badge } from "@/components/ui"

interface SectionHeaderProps {
  badge: string
  title: string
  subtitle?: string
  className?: string
  badgeVariant?: "default" | "brand" | "success" | "warning" | "info"
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

export function SectionHeader({ badge, title, subtitle, className, badgeVariant = "default" }: SectionHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className={className}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
        <Badge variant={badgeVariant} size="sm" className="mb-4">
          {badge}
        </Badge>
      </motion.div>
      <motion.h2
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-4 max-w-2xl text-foreground-secondary"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
