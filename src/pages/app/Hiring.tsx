import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CircleCheck,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useStore } from '../../lib/store'
import { isSupabaseConfigured } from '../../lib/supabase'
import {
  createJob,
  decideProposal,
  fetchApplicants,
  fetchMyJobs,
  startConversation,
  type UiApplicant,
} from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import { formatPay, type JobType } from '../../data/jobs'

const MIN_WAGE = 13.9

export function Hiring() {
  const { ta, lang } = useI18n()
  const { postings, addPosting } = useStore()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [city, setCity] = useState('')
  const [pay, setPay] = useState('')
  const [hours, setHours] = useState('')
  const [type, setType] = useState<JobType>('werkstudent')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const live = isSupabaseConfigured

  const myJobs = useAsyncData(
    () => (live ? fetchMyJobs() : Promise.resolve(null)),
    [],
  )
  const applicants = useAsyncData(
    () => (live ? fetchApplicants() : Promise.resolve(null)),
    [],
  )

  const field =
    'mt-1.5 w-full rounded-btn border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60'
  const label = 'text-sm font-semibold'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (
      !title.trim() ||
      !company.trim() ||
      !city.trim() ||
      !pay ||
      !hours.trim() ||
      !description.trim()
    ) {
      setError(ta.hiring.errorRequired)
      return
    }
    const payNum = Number(pay)
    if (!Number.isFinite(payNum) || payNum < MIN_WAGE) {
      setError(ta.hiring.errorPay)
      return
    }

    setError(null)

    if (!live) {
      addPosting({
        title: title.trim(),
        city: city.trim(),
        payEUR: payNum,
        hoursPerWeek: hours.trim(),
        type,
        description: description.trim(),
        employerName: company.trim(),
      })
    } else {
      setBusy(true)
      try {
        await createJob({
          title: title.trim(),
          employerName: company.trim(),
          city: city.trim(),
          payEUR: payNum,
          hoursPerWeek: hours.trim(),
          type,
          description: description.trim(),
        })
        myJobs.reload()
      } catch (err) {
        setError(err instanceof Error ? err.message : ta.common.genericError)
        setBusy(false)
        return
      }
      setBusy(false)
    }

    setTitle('')
    setCompany('')
    setCity('')
    setPay('')
    setHours('')
    setDescription('')
  }

  const onDecide = async (proposalId: string, status: 'accepted' | 'declined') => {
    try {
      await decideProposal(proposalId, status)
      applicants.reload()
    } catch {
      /* surfaced on next reload; keep UI simple */
    }
  }

  const onMessage = async (profileId: string) => {
    try {
      await startConversation(profileId)
      navigate('/app/messages')
    } catch {
      /* no-op: relationship missing */
    }
  }

  const applicantsFor = (jobId: string): UiApplicant[] =>
    (applicants.data ?? []).filter((a) => a.jobId === jobId)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
      day: 'numeric',
      month: 'short',
    })

  interface PostingView {
    id: string
    title: string
    city: string
    payEUR: number
    type: JobType
    verified: boolean
  }

  const postingViews: PostingView[] = live
    ? (myJobs.data ?? []).map((j) => ({
        id: j.id,
        title: j.title,
        city: j.city,
        payEUR: j.payEUR,
        type: j.type,
        verified: j.verified,
      }))
    : postings.map((p) => ({
        id: p.id,
        title: p.title,
        city: p.city,
        payEUR: p.payEUR,
        type: p.type,
        verified: true,
      }))

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{ta.hiring.title}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">{ta.hiring.sub}</p>

      <form onSubmit={onSubmit} className="glass mt-6 rounded-card p-6 shadow-card md:p-8" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="hiring-title" className={label}>
              {ta.hiring.titleLabel}
            </label>
            <input
              id="hiring-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={ta.hiring.titlePlaceholder}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="hiring-company" className={label}>
              {ta.hiring.companyLabel}
            </label>
            <input
              id="hiring-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={ta.hiring.companyPlaceholder}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="hiring-city" className={label}>
              {ta.hiring.cityLabel}
            </label>
            <input
              id="hiring-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={ta.hiring.cityPlaceholder}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="hiring-pay" className={label}>
              {ta.hiring.payLabel}
            </label>
            <input
              id="hiring-pay"
              type="number"
              step="0.1"
              min={MIN_WAGE}
              inputMode="decimal"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="15.00"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="hiring-hours" className={label}>
              {ta.hiring.hoursLabel}
            </label>
            <input
              id="hiring-hours"
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={ta.hiring.hoursPlaceholder}
              className={field}
            />
          </div>
          <div>
            <span className={label}>{ta.hiring.typeLabel}</span>
            <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label={ta.hiring.typeLabel}>
              {(Object.keys(ta.jobTypes) as JobType[]).map((jobType) => (
                <button
                  key={jobType}
                  type="button"
                  aria-pressed={type === jobType}
                  onClick={() => setType(jobType)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    type === jobType
                      ? 'bg-primary text-white'
                      : 'border text-ink-muted hover:text-primary'
                  }`}
                >
                  {ta.jobTypes[jobType]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="hiring-desc" className={label}>
            {ta.hiring.descLabel}
          </label>
          <textarea
            id="hiring-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={ta.hiring.descPlaceholder}
            className={`${field} resize-y`}
          />
        </div>

        <p className="mt-5 flex items-start gap-2.5 rounded-btn bg-success/10 p-3.5 text-sm text-ink-muted">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          {ta.hiring.complianceNote}
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-primary">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card transition enabled:hover:bg-primary-deep enabled:motion-safe:hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
        >
          {ta.hiring.publish}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-bold tracking-tight">{ta.hiring.yourPostings}</h2>
      {live && myJobs.loading ? (
        <p className="mt-4 text-center text-sm text-ink-muted">{ta.common.loading}…</p>
      ) : postingViews.length === 0 ? (
        <p className="glass mt-4 rounded-card p-8 text-center text-sm text-ink-muted">
          {ta.hiring.noPostings}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {postingViews.map((posting) => {
            const jobApplicants = live ? applicantsFor(posting.id) : []
            return (
              <li
                key={posting.id}
                className="rounded-card border bg-surface p-5 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{posting.title}</h3>
                  {posting.verified ? (
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                      {ta.hiring.liveBadge}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                      <Clock size={12} aria-hidden="true" />
                      {ta.hiring.pendingReviewBadge}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
                  <MapPin size={13} aria-hidden="true" />
                  {posting.city}
                  <span aria-hidden="true">·</span>
                  {ta.jobTypes[posting.type]}
                  <span aria-hidden="true">·</span>
                  {formatPay(posting.payEUR, lang)} {ta.common.perHour}
                </p>

                {live && (
                  <div className="mt-4 border-t pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      {ta.hiring.applicantsTitle}
                    </p>
                    {jobApplicants.length === 0 ? (
                      <p className="mt-2 text-sm text-ink-muted">
                        {ta.hiring.noApplicants}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-3">
                        {jobApplicants.map((applicant) => (
                          <li
                            key={applicant.proposalId}
                            className="rounded-btn border bg-surface/70 p-3.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold">
                                {applicant.name}
                                <span className="ml-2 font-normal text-ink-muted">
                                  {applicant.hoursPerWeek} {ta.common.hoursPerWeek} ·{' '}
                                  {formatDate(applicant.date)}
                                </span>
                              </p>
                              {applicant.status === 'accepted' && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-success">
                                  <CircleCheck size={13} aria-hidden="true" />
                                  {ta.proposals.statusAccepted}
                                </span>
                              )}
                              {applicant.status === 'declined' && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-ink-muted">
                                  <XCircle size={13} aria-hidden="true" />
                                  {ta.proposals.statusDeclined}
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 text-sm text-ink-muted">
                              “{applicant.message}”
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {applicant.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onDecide(applicant.proposalId, 'accepted')}
                                    className="rounded-btn bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-deep"
                                  >
                                    {ta.hiring.accept}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDecide(applicant.proposalId, 'declined')}
                                    className="rounded-btn border px-3.5 py-2 text-xs font-semibold text-ink-muted transition hover:text-ink"
                                  >
                                    {ta.hiring.decline}
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => onMessage(applicant.profileId)}
                                className="flex items-center gap-1.5 rounded-btn border px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                              >
                                <MessageCircle size={13} aria-hidden="true" />
                                {ta.candidates.message}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
