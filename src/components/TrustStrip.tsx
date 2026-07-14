import { CircleCheck } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'

/* Placeholder partner wordmarks get varied type treatments so the row
   reads as distinct brands rather than repeated text. */
const logoStyles = [
  'text-lg font-bold tracking-tight',
  'font-serif text-lg italic',
  'text-sm font-semibold uppercase tracking-[0.25em]',
  'text-lg font-extrabold',
  'text-lg font-medium tracking-wide',
]

export function TrustStrip() {
  const { t } = useI18n()

  return (
    <section className="py-14">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Reveal>
          <p className="text-center text-sm font-medium text-ink-muted">
            {t.trust.headline}
          </p>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-ink/50">
            {t.trust.logos.map((logo, i) => (
              <li key={logo} className={logoStyles[i % logoStyles.length]}>
                {logo}
              </li>
            ))}
          </ul>

          <ul className="mt-9 flex flex-wrap justify-center gap-3">
            {t.trust.chips.map((chip) => (
              <li
                key={chip}
                className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              >
                <CircleCheck size={16} className="shrink-0 text-success" aria-hidden="true" />
                {chip}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
