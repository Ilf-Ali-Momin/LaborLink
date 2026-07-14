import { Link } from 'react-router-dom'
import { ArrowUpRight, BadgeCheck, MapPin } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'
import { ButtonRouterLink } from './ui/Button'

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function JobGrid() {
  const { t } = useI18n()

  return (
    <section id="jobs" className="scroll-mt-28 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading kicker={t.jobs.kicker} title={t.jobs.title} sub={t.jobs.sub} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.jobs.listings.map((job, i) => (
            <Reveal key={job.title} index={i % 3}>
              <article className="h-full rounded-card border bg-surface p-6 shadow-card transition hover:shadow-card-hover motion-safe:hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <BadgeCheck size={14} aria-hidden="true" />
                    {t.jobs.verified}
                  </span>
                </div>

                <h3 className="mt-5 text-[17px] font-semibold leading-snug">
                  {job.title}
                </h3>
                <div className="mt-2.5 flex items-center gap-2 text-sm text-ink-muted">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-primary-soft text-xs font-bold text-primary"
                  >
                    {initials(job.employer)}
                  </span>
                  <span>{job.employer}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} aria-hidden="true" />
                    {job.city}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p>
                    <span className="text-lg font-bold">{job.pay}</span>{' '}
                    <span className="text-xs text-ink-muted">{t.jobs.perHour}</span>
                  </p>
                  <Link
                    to="/app/jobs"
                    className="flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-deep"
                  >
                    {t.jobs.view}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <ButtonRouterLink to="/app/jobs" variant="outline">
            {t.jobs.browseAll}
          </ButtonRouterLink>
        </Reveal>
      </div>
    </section>
  )
}
