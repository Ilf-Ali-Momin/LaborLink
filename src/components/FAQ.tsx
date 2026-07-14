import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

export function FAQ() {
  const { t } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const reduceMotion = useReducedMotion()

  return (
    <section id="faq" className="scroll-mt-28 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading kicker={t.faq.kicker} title={t.faq.title} sub={t.faq.sub} />

        <div className="space-y-3">
          {t.faq.items.map((item, i) => {
            const open = openIndex === i
            return (
              <Reveal key={item.q} index={i}>
                <div className="glass overflow-hidden rounded-card shadow-card">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
                  >
                    {item.q}
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className={`shrink-0 text-primary transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-muted">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
