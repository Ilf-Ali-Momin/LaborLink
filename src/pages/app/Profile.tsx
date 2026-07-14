import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  CircleCheck,
  Download,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useStore } from '../../lib/store'
import { useI18n } from '../../lib/i18n'
import { isSupabaseConfigured } from '../../lib/supabase'
import { deleteMyDataDb, exportMyData, fetchMyCounts } from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import { LangToggle } from '../../components/ui/LangToggle'
import { ThemeSwitch } from '../../components/ui/ThemeSwitch'

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Profile() {
  const { session, signOut } = useAuth()
  const store = useStore()
  const { ta, lang } = useI18n()
  const navigate = useNavigate()

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleted, setDeleted] = useState(false)
  const live = isSupabaseConfigured

  // Refetches after a deletion so the tiles drop to zero immediately.
  const counts = useAsyncData(
    () => (live ? fetchMyCounts() : Promise.resolve(null)),
    [deleted],
  )

  if (!session) return null

  const isEmployer = session.role === 'employer'

  const proposalCount = live
    ? counts.data?.proposals ?? 0
    : store.proposals.length
  const postingCount = live ? counts.data?.jobs ?? 0 : store.postings.length

  const stats = isEmployer
    ? [
        { label: ta.hiring.yourPostings, value: String(postingCount) },
        { label: ta.candidates.title, value: live ? '–' : '4' },
        { label: ta.tabs.messages, value: live ? '–' : '3' },
      ]
    : [
        { label: ta.profile.earnings, value: lang === 'de' ? '642 €' : '€642' },
        { label: ta.profile.hoursMonth, value: lang === 'de' ? '38,5' : '38.5' },
        { label: ta.profile.proposalsSent, value: String(proposalCount) },
      ]

  /** GDPR export: everything stored about the user, local or backend. */
  const exportData = async () => {
    const stored = live
      ? await exportMyData()
      : {
          proposals: store.proposals,
          postings: store.postings,
          sentMessages: store.sentMessages,
        }
    const payload = {
      exportedAt: new Date().toISOString(),
      session,
      ...stored,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'laborlink-data.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * GDPR style erasure, guarded by typing the confirmation sentence.
   * The session stays: only the stored app data is wiped.
   */
  const phraseMatches =
    deleteText.trim().toLowerCase() === ta.profile.deletePhrase.toLowerCase()

  const deleteData = async () => {
    if (!phraseMatches) return
    if (live) {
      await deleteMyDataDb()
    } else {
      store.resetAll()
    }
    setConfirmingDelete(false)
    setDeleteText('')
    setDeleted(true)
  }

  const cardTitle = 'text-sm font-bold uppercase tracking-wide text-ink-muted'
  const row =
    'flex items-center justify-between gap-3 border-t py-3.5 first:border-t-0 first:pt-0 last:pb-0'

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{ta.profile.title}</h1>

      {/* Identity */}
      <div className="glass mt-6 rounded-card p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
          >
            {initials(session.name)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-lg font-semibold">
              {session.name}
              <BadgeCheck size={17} className="text-success" aria-hidden="true" />
            </p>
            <p className="truncate text-sm text-ink-muted">{session.email}</p>
            <span className="mt-1.5 inline-block rounded-full bg-primary-soft px-3 py-0.5 text-xs font-semibold text-primary">
              {isEmployer ? ta.profile.roleEmployer : ta.profile.roleStudent}
            </span>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-btn border bg-surface/70 p-4">
              <dd className="text-2xl font-bold tracking-tight">{stat.value}</dd>
              <dt className="mt-0.5 text-xs font-medium text-ink-muted">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      {/* Compliance */}
      <div className="glass mt-4 flex items-start gap-3 rounded-card p-6 shadow-card">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <ShieldCheck size={20} aria-hidden="true" />
        </span>
        <div>
          <p className={cardTitle}>{ta.profile.complianceTitle}</p>
          <p className="mt-1 font-semibold text-success">{ta.profile.complianceOk}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{ta.profile.complianceSub}</p>
        </div>
      </div>

      {/* Settings */}
      <div className="glass mt-4 rounded-card p-6 shadow-card">
        <p className={cardTitle}>{ta.profile.settingsTitle}</p>
        <div className="mt-4">
          <div className={row}>
            <span className="text-sm font-medium">{ta.profile.language}</span>
            <LangToggle />
          </div>
          <div className={row}>
            <span className="text-sm font-medium">{ta.profile.theme}</span>
            <ThemeSwitch />
          </div>
          <div className={row}>
            <span className="text-sm font-medium">
              {isEmployer ? ta.profile.roleEmployer : ta.profile.roleStudent}
            </span>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-soft"
            >
              <RefreshCw size={13} aria-hidden="true" />
              {ta.profile.switchRole}
            </button>
          </div>
        </div>
      </div>

      {/* Data (GDPR) */}
      <div className="glass mt-4 rounded-card p-6 shadow-card">
        <p className={cardTitle}>{ta.profile.dataTitle}</p>
        <p className="mt-2 text-sm text-ink-muted">{ta.profile.dataNote}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportData}
            className="flex items-center gap-2 rounded-btn border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-soft"
          >
            <Download size={15} aria-hidden="true" />
            {ta.profile.dataExport}
          </button>
          {!confirmingDelete && (
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(true)
                setDeleted(false)
              }}
              className="flex items-center gap-2 rounded-btn border px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-primary/40 hover:text-ink"
            >
              <Trash2 size={15} aria-hidden="true" />
              {ta.profile.dataDelete}
            </button>
          )}
        </div>

        {confirmingDelete && (
          <div className="mt-4 rounded-btn border p-4">
            <p className="text-sm leading-relaxed text-ink-muted">
              {ta.profile.deletePrompt}
            </p>
            <p className="mt-2 text-sm font-bold">“{ta.profile.deletePhrase}”</p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              aria-label={ta.profile.deletePhrase}
              className="mt-3 w-full rounded-btn border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={deleteData}
                disabled={!phraseMatches}
                className="flex items-center gap-2 rounded-btn bg-ink px-4 py-2.5 text-sm font-semibold text-bg transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={15} aria-hidden="true" />
                {ta.profile.deleteConfirm}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false)
                  setDeleteText('')
                }}
                className="rounded-btn px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-primary-soft hover:text-primary"
              >
                {ta.common.cancel}
              </button>
            </div>
          </div>
        )}

        {deleted && !confirmingDelete && (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
            <CircleCheck size={15} aria-hidden="true" />
            {ta.profile.deleteDone}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut()
          navigate('/')
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-btn border px-5 py-3 text-sm font-semibold text-ink-muted transition hover:bg-primary-soft hover:text-primary"
      >
        <LogOut size={15} aria-hidden="true" />
        {ta.profile.signOut}
      </button>
    </div>
  )
}
