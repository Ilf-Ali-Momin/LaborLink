import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Fade and rise on scroll into view (16px, 400ms per DESIGN.md).
 * Pass an index to stagger siblings. Renders static when the user
 * prefers reduced motion.
 */
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode
  index?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
