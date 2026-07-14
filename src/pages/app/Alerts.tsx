import { useState } from 'react'
import {
  CircleCheck,
  Eye,
  FileCheck,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useStore } from '../../lib/store'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchAlerts, markAlertsReadDb, type UiAlert } from '../../lib/api'
import { useAsyncData } from '../../lib/use-async'
import { alerts as seedAlerts, type AlertKind } from '../../data/alerts'

const kindIcons: Record<AlertKind, LucideIcon> = {
  compliance: ShieldAlert,
  proposal: Eye,
  match: Sparkles,
  contract: FileCheck,
}

export function Alerts() {
  const { ta, lang } = useI18n()
  const { alertsReadAt, markAlertsRead } = useStore()
  const live = isSupabaseConfigured
  const [busy, setBusy] = useState(false)

  const liveData = useAsyncData(
    () => (live ? fetchAlerts() : Promise.resolve(null)),
    [],
  )

  const items: UiAlert[] = live
    ? liveData.data ?? []
    : seedAlerts.map((alert) => ({
        id: alert.id,
        kind: alert.kind,
        title: alert.title[lang],
        body: alert.body[lang],
        time: alert.time[lang],
        unread: !alertsReadAt,
      }))

  const anyUnread = items.some((a) => a.unread)

  const onMarkRead = async () => {
    if (!live) {
      markAlertsRead()
      return
    }
    setBusy(true)
    try {
      await markAlertsReadDb()
      liveData.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{ta.alerts.title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{ta.alerts.sub}</p>
        </div>
        {anyUnread ? (
          <button
            type="button"
            onClick={onMarkRead}
            disabled={busy}
            className="rounded-full border px-4 py-2 text-xs font-semibold text-primary transition enabled:hover:bg-primary-soft disabled:cursor-wait disabled:opacity-60"
          >
            {ta.alerts.markRead}
          </button>
        ) : (
          items.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <CircleCheck size={14} aria-hidden="true" />
              {ta.alerts.allRead}
            </span>
          )
        )}
      </div>

      {live && liveData.loading ? (
        <p className="mt-10 text-center text-sm text-ink-muted">
          {ta.common.loading}…
        </p>
      ) : items.length === 0 ? (
        <p className="glass mt-6 rounded-card p-10 text-center text-sm text-ink-muted">
          {ta.alerts.allRead}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((alert) => {
            const Icon = kindIcons[alert.kind]
            // Contract readiness is a trust cue; everything else stays blue.
            const iconColor =
              alert.kind === 'contract'
                ? 'bg-success/10 text-success'
                : 'bg-primary-soft text-primary'
            return (
              <li
                key={alert.id}
                className="flex items-start gap-4 rounded-card border bg-surface p-5 shadow-card"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-btn ${iconColor}`}
                >
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold leading-snug">{alert.title}</h2>
                    {alert.unread && (
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full bg-primary"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {alert.body}
                  </p>
                  <p className="mt-2 text-xs text-ink-muted">{alert.time}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
