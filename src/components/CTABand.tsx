import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'

/** Full width gradient band repeating the split student/employer CTA. */
export function CTABand() {
  const { t } = useI18n()

  return (
    <section className="py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-primary-deep px-6 py-16 text-center text-white shadow-card-hover md:py-20">
            <div
              aria-hidden="true"
              className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl"
            />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight md:text-[40px]">
                {t.cta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">{t.cta.sub}</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/login?role=student"
                  className="inline-flex items-center gap-2 rounded-btn bg-white px-6 py-3 text-sm font-semibold text-primary shadow-card transition hover:bg-primary-soft motion-safe:hover:-translate-y-0.5"
                >
                  {t.cta.student}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  to="/login?role=employer"
                  className="inline-flex items-center gap-2 rounded-btn border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 motion-safe:hover:-translate-y-0.5"
                >
                  {t.cta.employer}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
