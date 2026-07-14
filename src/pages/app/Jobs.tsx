import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, MapPin, Search } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { isSupabaseConfigured } from '../../lib/supabase'
import { demoJobsToUi, fetchJobs, type UiJob } from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import { formatPay, type JobType } from '../../data/jobs'

type Filter = JobType | 'all'

export function Jobs() {
  const { ta, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const { data: liveJobs, loading, error } = useAsyncData<UiJob[] | null>(
    () => (isSupabaseConfigured ? fetchJobs() : Promise.resolve(null)),
    [],
  )

  const allJobs: UiJob[] = isSupabaseConfigured
    ? liveJobs ?? []
    : demoJobsToUi(lang)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allJobs.filter((job) => {
      if (filter !== 'all' && job.type !== filter) return false
      if (!q) return true
      return [job.title, job.employer, job.city]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [allJobs, query, filter])

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: ta.jobs.filterAll },
    { value: 'minijob', label: ta.jobTypes.minijob },
    { value: 'werkstudent', label: ta.jobTypes.werkstudent },
    { value: 'oneoff', label: ta.jobTypes.oneoff },
  ]

  const posted = (days: number) => {
    if (days === 0) return ta.jobs.postedToday
    if (days === 1) return ta.jobs.postedYesterday
    return ta.jobs.postedDays.replace('{n}', String(days))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{ta.jobs.title}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">{ta.jobs.sub}</p>

      <div className="glass mt-6 flex items-center gap-2 rounded-full px-4 py-1 shadow-card">
        <Search size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ta.jobs.searchPlaceholder}
          aria-label={ta.jobs.searchPlaceholder}
          className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-muted/60"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={ta.jobDetail.type}>
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'glass text-ink-muted hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isSupabaseConfigured && loading && (
        <p className="mt-6 text-center text-sm text-ink-muted">
          {ta.common.loading}…
        </p>
      )}
      {error && (
        <p role="alert" className="glass mt-6 rounded-card p-6 text-center text-sm text-ink-muted">
          {ta.common.genericError}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {filtered.map((job) => (
          <Link
            key={job.id}
            to={`/app/jobs/${job.id}`}
            className="rounded-card border bg-surface p-5 shadow-card transition hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"
          >
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

            <h2 className="mt-4 font-semibold leading-snug">{job.title}</h2>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
              {job.employer}
              <span aria-hidden="true">·</span>
              <MapPin size={13} aria-hidden="true" />
              {job.city}
            </p>
            <div className="mt-4 flex items-baseline justify-between border-t pt-3">
              <p>
                <span className="font-bold">{formatPay(job.payEUR, lang)}</span>{' '}
                <span className="text-xs text-ink-muted">{ta.common.perHour}</span>
              </p>
              <p className="text-xs text-ink-muted">{posted(job.postedDaysAgo)}</p>
            </div>
          </Link>
        ))}
      </div>

      {!loading && filtered.length === 0 && !error && (
        <p className="glass mt-6 rounded-card p-8 text-center text-sm text-ink-muted">
          {ta.jobs.empty}
        </p>
      )}
    </div>
  )
}
