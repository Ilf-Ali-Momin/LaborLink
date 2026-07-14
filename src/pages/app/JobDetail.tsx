import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleCheck,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { useStore } from '../../lib/store'
import { isSupabaseConfigured } from '../../lib/supabase'
import {
  demoJobsToUi,
  fetchJob,
  hasProposalFor,
  type UiJob,
} from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import { formatPay } from '../../data/jobs'

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function JobDetail() {
  const { id } = useParams()
  const { ta, lang } = useI18n()
  const { session } = useAuth()
  const { hasProposal } = useStore()
  const isStudent = session?.role === 'student'

  const { data, loading } = useAsyncData(
    async () => {
      if (!isSupabaseConfigured || !id) return null
      const [job, applied] = await Promise.all([
        fetchJob(id),
        isStudent ? hasProposalFor(id) : Promise.resolve(false),
      ])
      return { job, applied }
    },
    [id, isStudent],
  )

  const job: UiJob | undefined = isSupabaseConfigured
    ? data?.job ?? undefined
    : demoJobsToUi(lang).find((j) => j.id === id)

  if (isSupabaseConfigured && loading) {
    return (
      <p className="mt-10 text-center text-sm text-ink-muted">
        {ta.common.loading}…
      </p>
    )
  }

  if (!job) {
    return (
      <div className="glass rounded-card p-10 text-center">
        <p className="font-medium">{ta.jobDetail.notFound}</p>
        <Link
          to="/app/jobs"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {ta.jobDetail.backToJobs}
        </Link>
      </div>
    )
  }

  const applied = isSupabaseConfigured
    ? data?.applied ?? false
    : hasProposal(job.id)

  const stats = [
    { label: ta.jobDetail.pay, value: `${formatPay(job.payEUR, lang)} ${ta.common.perHour}` },
    { label: ta.jobDetail.hours, value: `${job.hoursPerWeek} ${ta.common.hoursPerWeek}` },
    { label: ta.jobDetail.type, value: ta.jobTypes[job.type] },
  ]

  return (
    <div>
      <Link
        to="/app/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {ta.common.back}
      </Link>

      <div className="glass mt-4 rounded-card p-6 shadow-card md:p-8">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            {ta.jobTypes[job.type]}
          </span>
          {job.verified && (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <BadgeCheck size={14} aria-hidden="true" />
              {ta.common.verified}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight">
          {job.title}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-primary-soft text-xs font-bold text-primary"
          >
            {initials(job.employer)}
          </span>
          {job.employer}
          <span aria-hidden="true">·</span>
          <MapPin size={13} aria-hidden="true" />
          {job.city}
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-btn border bg-surface/70 p-3.5">
              <dt className="text-xs font-medium text-ink-muted">{stat.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-7 text-sm font-bold uppercase tracking-wide text-ink-muted">
          {ta.jobDetail.about}
        </h2>
        <p className="mt-2 leading-relaxed">{job.blurb}</p>

        {job.tasks.length > 0 && (
          <>
            <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-muted">
              {ta.jobDetail.tasks}
            </h2>
            <ul className="mt-2 space-y-2">
              {job.tasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5">
                  <Check
                    size={17}
                    className="mt-0.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {task}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-7 flex items-start gap-3 rounded-btn bg-success/10 p-4">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-semibold text-success">{ta.jobDetail.complianceTitle}</p>
            <p className="mt-0.5 text-sm text-ink-muted">{ta.jobDetail.complianceBody}</p>
          </div>
        </div>

        {isStudent &&
          (applied ? (
            <p className="mt-7 flex w-full items-center justify-center gap-2 rounded-btn bg-success/10 px-5 py-3 text-sm font-semibold text-success">
              <CircleCheck size={17} aria-hidden="true" />
              {ta.jobDetail.applied}
            </p>
          ) : (
            <Link
              to={`/app/jobs/${job.id}/propose`}
              className="mt-7 block w-full rounded-btn bg-primary px-5 py-3 text-center text-sm font-semibold text-white shadow-card transition hover:bg-primary-deep motion-safe:hover:-translate-y-0.5"
            >
              {ta.jobDetail.apply}
            </Link>
          ))}
      </div>
    </div>
  )
}
