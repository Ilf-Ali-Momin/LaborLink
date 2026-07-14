import { Search, ShieldCheck, Wallet } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

const icons = [Search, ShieldCheck, Wallet]

export function HowItWorks() {
  const { t } = useI18n()

  return (
    <section id="how" className="scroll-mt-28 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading kicker={t.how.kicker} title={t.how.title} sub={t.how.sub} />

        <div className="grid gap-6 md:grid-cols-3">
          {t.how.steps.map((step, i) => {
            const Icon = icons[i]
            return (
              <Reveal key={step.title} index={i}>
                <article className="glass relative h-full rounded-card p-8 shadow-card transition hover:shadow-card-hover motion-safe:hover:-translate-y-0.5">
                  <span
                    aria-hidden="true"
                    className="absolute right-7 top-7 text-sm font-bold text-primary/30"
                  >
                    0{i + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-btn bg-primary-soft text-primary">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-[21px] font-semibold">{step.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-ink-muted">{step.body}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
