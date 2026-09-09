import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/** Scroll-triggered reveal. Under reduced motion the content renders plainly —
 *  it is never parked at opacity 0 waiting on an observer. */
export function Reveal({ children, delay = 0, y = 22, className }: {
  children: ReactNode; delay?: number; y?: number; className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Staggers direct children as the group enters the viewport. */
export function RevealGroup({ children, className, stagger = 0.08 }: {
  children: ReactNode; className?: string; stagger?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export const revealItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}
