import { Quote, TrendingUp } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import type { Testimonial } from '../content'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function Person({ person }: { person: Testimonial }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
      >
        {initials(person.name)}
      </span>
      <div>
        <p className="text-sm font-semibold leading-tight">{person.name}</p>
        <p className="text-xs text-ink-muted">{person.role}</p>
      </div>
    </div>
  )
}

export function Testimonials() {
  const { t } = useI18n()

  return (
    <section className="py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading
          kicker={t.testimonials.kicker}
          title={t.testimonials.title}
          sub={t.testimonials.sub}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <figure className="glass flex h-full flex-col rounded-card p-8 shadow-card md:p-10">
              <span className="flex h-11 w-11 items-center justify-center rounded-btn bg-primary-soft text-primary">
                <Quote size={20} aria-hidden="true" />
              </span>
              <blockquote className="mt-6 flex-1 text-xl font-medium leading-snug md:text-2xl">
                {t.testimonials.featured.quote}
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <Person person={t.testimonials.featured} />
                {t.testimonials.featured.stat && (
                  <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-bold text-primary">
                    <TrendingUp size={14} aria-hidden="true" />
                    {t.testimonials.featured.stat}
                  </span>
                )}
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col gap-6">
            {t.testimonials.others.map((person, i) => (
              <Reveal key={person.name} index={i + 1} className="flex-1">
                <figure className="flex h-full flex-col rounded-card border bg-surface p-6 shadow-card">
                  <blockquote className="flex-1 text-[15px] leading-relaxed">
                    {person.quote}
                  </blockquote>
                  <figcaption className="mt-5">
                    <Person person={person} />
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
