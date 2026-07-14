import {
  BadgeCheck,
  BadgeEuro,
  CalendarClock,
  CircleCheck,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'
import type { AudienceContent } from '../content'
import { Reveal } from './ui/Reveal'

const studentIcons: LucideIcon[] = [CalendarClock, BadgeEuro, MapPin]
const employerIcons: LucideIcon[] = [UserCheck, ShieldCheck, LayoutDashboard]

function MockCard({
  mock,
  variant,
}: {
  mock: AudienceContent['mock']
  variant: 'students' | 'employers'
}) {
  return (
    <div className="glass mx-auto w-full max-w-md rounded-card p-6 shadow-card">
      <h4 className="text-sm font-bold">{mock.header}</h4>
      <ul className="mt-4 space-y-2.5">
        {mock.rows.map((row) => (
          <li
            key={`${row.lead}${row.detail}`}
            className="flex items-center justify-between gap-3 rounded-btn border bg-surface/70 p-3"
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-primary-soft text-xs font-bold text-primary"
              >
                {row.lead.slice(0, 2)}
              </span>
              <span className="text-sm">
                <span className="block font-semibold leading-tight">{row.lead}</span>
                <span className="block text-ink-muted">{row.detail}</span>
              </span>
            </span>
            {variant === 'students' ? (
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                {row.trail}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <BadgeCheck size={14} aria-hidden="true" />
                {row.trail}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-xs font-medium text-ink-muted">
        <CircleCheck size={14} className="shrink-0 text-success" aria-hidden="true" />
        {mock.footer}
      </p>
    </div>
  )
}

function AudienceRow({
  id,
  audience,
  icons,
  variant,
  flip,
}: {
  id: string
  audience: AudienceContent
  icons: LucideIcon[]
  variant: 'students' | 'employers'
  flip?: boolean
}) {
  return (
    <section
      id={id}
      className="grid scroll-mt-28 items-center gap-12 py-12 lg:grid-cols-2"
    >
      <Reveal className={flip ? 'lg:order-last' : undefined}>
        <span className="glass inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {audience.kicker}
        </span>
        <h2 className="mt-5 max-w-lg text-3xl font-bold leading-[1.15] tracking-tight md:text-[36px]">
          {audience.title}
        </h2>
        <ul className="mt-8 space-y-6">
          {audience.points.map((point, i) => {
            const Icon = icons[i]
            return (
              <li key={point.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-primary-soft text-primary">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {point.body}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </Reveal>

      <Reveal index={1}>
        <MockCard mock={audience.mock} variant={variant} />
      </Reveal>
    </section>
  )
}

/** Two alternating value prop rows: students, then employers. */
export function ForStudentsEmployers() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <AudienceRow
        id="students"
        audience={t.audiences.students}
        icons={studentIcons}
        variant="students"
      />
      <AudienceRow
        id="employers"
        audience={t.audiences.employers}
        icons={employerIcons}
        variant="employers"
        flip
      />
    </div>
  )
}
