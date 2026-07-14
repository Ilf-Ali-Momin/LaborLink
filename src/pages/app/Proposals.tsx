import { Link } from 'react-router-dom'
import { CircleCheck, Clock, MapPin, XCircle } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useStore } from '../../lib/store'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchMyProposals, type UiProposal } from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import type { ProposalStatus } from '../../lib/db-types'
import { getJob } from '../../data/jobs'

export function Proposals() {
  const { ta, lang } = useI18n()
  const store = useStore()

  const { data: liveProposals, loading } = useAsyncData(
    () => (isSupabaseConfigured ? fetchMyProposals() : Promise.resolve(null)),
    [],
  )

  const items: UiProposal[] = isSupabaseConfigured
    ? liveProposals ?? []
    : store.proposals
        .map((p) => {
          const job = getJob(p.jobId)
          if (!job) return null
          return {
            id: p.jobId,
            jobId: p.jobId,
            jobTitle: job.title[lang],
            employer: job.employer,
            city: job.city,
            message: p.message,
            hoursPerWeek: p.hoursPerWeek,
            status: 'pending' as ProposalStatus,
            date: p.date,
          }
        })
        .filter((p): p is UiProposal => p !== null)
        .sort((a, b) => b.date.localeCompare(a.date))

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  const statusLabel: Record<ProposalStatus, string> = {
    pending: ta.proposals.statusPending,
    accepted: ta.proposals.statusAccepted,
    declined: ta.proposals.statusDeclined,
    withdrawn: ta.proposals.statusWithdrawn,
  }

  const statusChip = (status: ProposalStatus) => {
    if (status === 'accepted') {
      return (
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
          <CircleCheck size={13} aria-hidden="true" />
          {statusLabel[status]}
        </span>
      )
    }
    const Icon = status === 'pending' ? Clock : XCircle
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
        <Icon size={13} aria-hidden="true" />
        {statusLabel[status]}
      </span>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{ta.proposals.title}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">{ta.proposals.sub}</p>

      {isSupabaseConfigured && loading ? (
        <p className="mt-10 text-center text-sm text-ink-muted">
          {ta.common.loading}…
        </p>
      ) : items.length === 0 ? (
        <div className="glass mt-6 rounded-card p-10 text-center">
          <p className="text-sm text-ink-muted">{ta.proposals.empty}</p>
          <Link
            to="/app/jobs"
            className="mt-5 inline-block rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-primary-deep motion-safe:hover:-translate-y-0.5"
          >
            {ta.proposals.emptyCta}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((proposal) => (
            <li key={proposal.id}>
              <Link
                to={`/app/jobs/${proposal.jobId}`}
                className="block rounded-card border bg-surface p-5 shadow-card transition hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">{proposal.jobTitle}</h2>
                  {statusChip(proposal.status)}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
                  {proposal.employer}
                  <span aria-hidden="true">·</span>
                  <MapPin size={13} aria-hidden="true" />
                  {proposal.city}
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-ink-muted">
                  “{proposal.message}”
                </p>
                <p className="mt-3 border-t pt-3 text-xs text-ink-muted">
                  {ta.proposals.submitted} · {formatDate(proposal.date)} ·{' '}
                  {proposal.hoursPerWeek} {ta.common.hoursPerWeek}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
