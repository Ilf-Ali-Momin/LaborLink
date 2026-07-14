import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useStore } from '../../lib/store'
import { isSupabaseConfigured } from '../../lib/supabase'
import {
  createProposal,
  demoJobsToUi,
  fetchJob,
  type UiJob,
} from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'

export function Propose() {
  const { id } = useParams()
  const { ta, lang } = useI18n()
  const { addProposal } = useStore()
  const navigate = useNavigate()

  const { data: liveJob, loading } = useAsyncData(
    () =>
      isSupabaseConfigured && id ? fetchJob(id) : Promise.resolve(null),
    [id],
  )

  const job: UiJob | undefined = isSupabaseConfigured
    ? liveJob ?? undefined
    : demoJobsToUi(lang).find((j) => j.id === id)

  const [message, setMessage] = useState('')
  const [hours, setHours] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (message.trim().length < 20) {
      setError(ta.proposal.errorMessage)
      return
    }
    const h = Number(hours)
    if (!Number.isFinite(h) || h < 1 || h > 20) {
      setError(ta.proposal.errorHours)
      return
    }

    const successState = {
      state: { jobTitle: job.title, employer: job.employer },
    }

    if (!isSupabaseConfigured) {
      addProposal({ jobId: job.id, message: message.trim(), hoursPerWeek: hours })
      navigate('/app/bravo', successState)
      return
    }

    setBusy(true)
    setError(null)
    try {
      await createProposal(job.id, message.trim(), h)
      navigate('/app/bravo', successState)
    } catch (err) {
      setError(err instanceof Error ? err.message : ta.common.genericError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Link
        to={`/app/jobs/${job.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {ta.common.back}
      </Link>

      <div className="glass mt-4 rounded-card p-6 shadow-card md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{ta.proposal.title}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {job.title} · {job.employer}
        </p>
        <p className="mt-3 text-sm text-ink-muted">{ta.proposal.sub}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="proposal-message" className="text-sm font-semibold">
              {ta.proposal.messageLabel}
            </label>
            <textarea
              id="proposal-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={ta.proposal.messagePlaceholder}
              className="mt-1.5 w-full resize-y rounded-btn border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60"
            />
          </div>

          <div>
            <label htmlFor="proposal-hours" className="block text-sm font-semibold">
              {ta.proposal.hoursLabel}
            </label>
            <input
              id="proposal-hours"
              type="number"
              min={1}
              max={20}
              inputMode="numeric"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={ta.proposal.hoursPlaceholder}
              className="mt-1.5 w-full max-w-[180px] rounded-btn border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-primary">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card transition enabled:hover:bg-primary-deep enabled:motion-safe:hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            >
              <Send size={15} aria-hidden="true" />
              {ta.proposal.submit}
            </button>
            <Link
              to={`/app/jobs/${job.id}`}
              className="inline-flex items-center rounded-btn px-5 py-3 text-sm font-semibold text-ink-muted transition hover:bg-primary-soft hover:text-primary"
            >
              {ta.common.cancel}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
