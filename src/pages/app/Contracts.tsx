import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CircleCheck, FileCheck, FileClock } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { formatPay } from '../../data/jobs'

/** Weekly Werkstudent limit summary + contract cards (Figma Contract page). */
export function Contracts() {
  const { ta, lang } = useI18n()
  const reduceMotion = useReducedMotion()
  // Demo state: signing the draft contract flips it to active locally.
  const [draftSigned, setDraftSigned] = useState(false)

  const hoursUsed = 18.5
  const hoursLimit = 20
  const pct = (hoursUsed / hoursLimit) * 100
  const hoursValue =
    lang === 'de'
      ? `${String(hoursUsed).replace('.', ',')} von ${hoursLimit}`
      : `${hoursUsed} of ${hoursLimit}`

  const signedDate = new Date().toLocaleDateString(
    lang === 'de' ? 'de-DE' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' },
  )

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{ta.contracts.title}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">{ta.contracts.sub}</p>

      {/* Weekly limit tracker */}
      <div className="glass mt-6 rounded-card p-6 shadow-card">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-ink-muted">{ta.contracts.hoursThisWeek}</span>
          <span className="font-semibold">{hoursValue}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft">
          {reduceMotion ? (
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          ) : (
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success">
          <CircleCheck size={14} aria-hidden="true" />
          {ta.contracts.limitSafe}
        </p>
      </div>

      <ul className="mt-6 space-y-4">
        {/* Active contract */}
        <li className="rounded-card border bg-surface p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-btn bg-primary-soft text-primary">
                <FileCheck size={19} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">
                  {lang === 'de' ? 'Nachhilfe Mathe' : 'Math tutor'}
                </h2>
                <p className="text-sm text-ink-muted">LernRaum · Berlin Neukölln</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
              <CircleCheck size={13} aria-hidden="true" />
              {ta.contracts.activeBadge}
            </span>
          </div>
          <p className="mt-4 border-t pt-3 text-xs text-ink-muted">
            {ta.contracts.signedOn} 2 Jun 2026 · {ta.contracts.payLabel}{' '}
            {formatPay(18, lang)} {ta.common.perHour}
          </p>
        </li>

        {/* Draft contract, signable in the demo */}
        <li className="rounded-card border bg-surface p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-btn bg-primary-soft text-primary">
                <FileClock size={19} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">
                  {lang === 'de' ? 'Barista am Wochenende' : 'Barista, weekend shifts'}
                </h2>
                <p className="text-sm text-ink-muted">Kaffeewerk Mitte · Berlin Mitte</p>
              </div>
            </div>
            {draftSigned ? (
              <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                <CircleCheck size={13} aria-hidden="true" />
                {ta.contracts.activeBadge}
              </span>
            ) : (
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                {ta.contracts.draftBadge}
              </span>
            )}
          </div>
          <p className="mt-4 border-t pt-3 text-xs text-ink-muted">
            {draftSigned
              ? `${ta.contracts.signedOn} ${signedDate}`
              : ta.contracts.awaitingSignature}{' '}
            · {ta.contracts.payLabel} {formatPay(14.5, lang)} {ta.common.perHour}
          </p>
          {!draftSigned && (
            <button
              type="button"
              onClick={() => setDraftSigned(true)}
              className="mt-4 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-primary-deep motion-safe:hover:-translate-y-0.5"
            >
              {ta.contracts.signNow}
            </button>
          )}
        </li>
      </ul>
    </div>
  )
}
