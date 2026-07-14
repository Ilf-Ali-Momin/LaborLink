import { useNavigate } from 'react-router-dom'
import { BadgeCheck, CalendarClock, MessageCircle } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchApplicants, startConversation } from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import { candidates as seedCandidates } from '../../data/candidates'

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface CandidateView {
  id: string
  name: string
  detail: string
  chips: string[]
  note: string
  profileId: string | null
}

/** Verified student candidates for employers (the Figma Member frame). */
export function Candidates() {
  const { ta, lang } = useI18n()
  const navigate = useNavigate()
  const live = isSupabaseConfigured

  const { data: applicants, loading } = useAsyncData(
    () => (live ? fetchApplicants() : Promise.resolve(null)),
    [],
  )

  // Live mode: distinct students who applied to my jobs.
  // Demo mode: bundled example candidates.
  const views: CandidateView[] = live
    ? [
        ...new Map(
          (applicants ?? []).map((a) => [a.profileId, a]),
        ).values(),
      ].map((a) => ({
        id: a.profileId,
        name: a.name,
        detail: ta.profile.roleStudent,
        chips: [
          ...new Set(
            (applicants ?? [])
              .filter((x) => x.profileId === a.profileId)
              .map((x) => x.jobTitle),
          ),
        ],
        note: `${a.hoursPerWeek} ${ta.common.hoursPerWeek}`,
        profileId: a.profileId,
      }))
    : seedCandidates.map((c) => ({
        id: c.id,
        name: c.name,
        detail: c.university,
        chips: c.skills[lang],
        note: `${ta.candidates.availability}: ${c.availability[lang]}`,
        profileId: null,
      }))

  const onMessage = async (view: CandidateView) => {
    if (!view.profileId) {
      navigate('/app/messages')
      return
    }
    try {
      await startConversation(view.profileId)
      navigate('/app/messages')
    } catch {
      /* relationship missing; nothing to do */
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{ta.candidates.title}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">{ta.candidates.sub}</p>

      {live && loading ? (
        <p className="mt-10 text-center text-sm text-ink-muted">
          {ta.common.loading}…
        </p>
      ) : views.length === 0 ? (
        <p className="glass mt-6 rounded-card p-10 text-center text-sm text-ink-muted">
          {ta.candidates.empty}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {views.map((candidate) => (
            <article
              key={candidate.id}
              className="rounded-card border bg-surface p-5 shadow-card transition hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                >
                  {initials(candidate.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="flex items-center gap-1.5 font-semibold leading-tight">
                    {candidate.name}
                    <BadgeCheck
                      size={15}
                      className="shrink-0 text-success"
                      aria-hidden="true"
                    />
                  </h2>
                  <p className="text-sm text-ink-muted">{candidate.detail}</p>
                </div>
              </div>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {candidate.chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary"
                  >
                    {chip}
                  </li>
                ))}
              </ul>

              <p className="mt-3.5 flex items-center gap-1.5 text-xs text-ink-muted">
                <CalendarClock size={13} aria-hidden="true" />
                {candidate.note}
              </p>

              <button
                type="button"
                onClick={() => onMessage(candidate)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-btn border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-soft"
              >
                <MessageCircle size={15} aria-hidden="true" />
                {ta.candidates.message}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
