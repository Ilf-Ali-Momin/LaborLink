import { motion, useReducedMotion } from 'framer-motion'
import { CircleCheck, FileCheck } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'

/** Green checkmark that draws itself when scrolled into view. */
function AnimatedCheck() {
  const reduceMotion = useReducedMotion()

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {reduceMotion ? (
        <path d="M5 13l4 4L19 7" />
      ) : (
        <motion.path
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        />
      )}
    </svg>
  )
}

/** The moat section: compliance copy + a mock employer dashboard panel. */
export function ComplianceMock() {
  const { t } = useI18n()
  const panel = t.compliance.panel
  const reduceMotion = useReducedMotion()

  // Abstracted payroll amounts: widths only, no fake numbers.
  const lineWidths = ['w-24', 'w-14', 'w-20', 'w-16']

  return (
    <section className="scroll-mt-28 py-24">
      <div className="mx-auto grid max-w-content items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <span className="glass inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            {t.compliance.kicker}
          </span>
          <h2 className="mt-5 max-w-lg text-3xl font-bold leading-[1.15] tracking-tight md:text-[40px]">
            {t.compliance.title}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted md:text-lg">
            {t.compliance.body}
          </p>
          <ul className="mt-7 space-y-3.5">
            {t.compliance.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <CircleCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-success"
                  aria-hidden="true"
                />
                <span className="font-medium">{bullet}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal index={1} className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="glass rounded-card p-6 shadow-card md:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold">{panel.header}</h3>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary"
                >
                  LM
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight">{panel.worker}</p>
                  <p className="text-xs text-ink-muted">{panel.workerSub}</p>
                </div>
              </div>
            </div>

            {/* Compliant state with animated check */}
            <div className="mt-5 flex items-center gap-3 rounded-btn bg-success/10 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <AnimatedCheck />
              </span>
              <div>
                <p className="font-semibold text-success">{panel.status}</p>
                <p className="text-xs text-ink-muted">{panel.statusNote}</p>
              </div>
            </div>

            {/* Hours tracked */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-ink-muted">{panel.hoursLabel}</span>
                <span className="font-semibold">{panel.hoursValue}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft">
                {reduceMotion ? (
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${panel.hoursPct}%` }}
                  />
                ) : (
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${panel.hoursPct}%` }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                  />
                )}
              </div>
            </div>

            {/* Contract status */}
            <div className="mt-5 flex items-center gap-3 rounded-btn border bg-surface/70 p-3.5">
              <FileCheck size={18} className="shrink-0 text-primary" aria-hidden="true" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-ink-muted">{panel.contractLabel}</p>
                <p className="font-semibold">{panel.contractValue}</p>
              </div>
            </div>

            {/* Abstracted payroll line items */}
            <div className="mt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {panel.payrollHeader}
              </p>
              <ul className="mt-3 space-y-2.5">
                {panel.lineItems.map((item, i) => (
                  <li key={item} className="flex items-center justify-between">
                    <span className="text-sm text-ink-muted">{item}</span>
                    <span
                      aria-hidden="true"
                      className={`h-2 rounded-full bg-ink/10 ${lineWidths[i % lineWidths.length]}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Floating status chip */}
          <div className="glass absolute -bottom-5 left-2 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-card sm:-left-6">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-success" />
            {panel.floatChip}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
