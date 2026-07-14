import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  FileCheck,
  FileText,
  Megaphone,
  MessageCircle,
  Search,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useStore } from '../../lib/store'
import { useI18n } from '../../lib/i18n'
import { isSupabaseConfigured } from '../../lib/supabase'
import { countUnreadAlerts } from '../../lib/api'
import { LangToggle } from '../ui/LangToggle'
import { ThemeToggle } from '../ui/ThemeToggle'

interface Tab {
  to: string
  label: string
  icon: LucideIcon
}

/** App chrome: glass top bar, bottom tab bar on mobile, role aware tabs. */
export function AppShell() {
  const { session } = useAuth()
  const { alertsReadAt } = useStore()
  const { ta } = useI18n()
  const location = useLocation()

  // Unread indicator: local flag in demo mode, cheap count query in live
  // mode (re-checked on navigation so it clears after reading).
  const [liveUnread, setLiveUnread] = useState(false)
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    countUnreadAlerts()
      .then((n) => {
        if (!cancelled) setLiveUnread(n > 0)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  const unread = isSupabaseConfigured ? liveUnread : !alertsReadAt

  const tabs: Tab[] =
    session?.role === 'employer'
      ? [
          { to: '/app/hiring', label: ta.tabs.hiring, icon: Megaphone },
          { to: '/app/candidates', label: ta.tabs.candidates, icon: Users },
          { to: '/app/contracts', label: ta.tabs.contracts, icon: FileCheck },
          { to: '/app/messages', label: ta.tabs.messages, icon: MessageCircle },
          { to: '/app/profile', label: ta.tabs.profile, icon: User },
        ]
      : [
          { to: '/app/jobs', label: ta.tabs.jobs, icon: Search },
          { to: '/app/proposals', label: ta.tabs.proposals, icon: FileText },
          { to: '/app/contracts', label: ta.tabs.contracts, icon: FileCheck },
          { to: '/app/messages', label: ta.tabs.messages, icon: MessageCircle },
          { to: '/app/profile', label: ta.tabs.profile, icon: User },
        ]

  const topLink = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-primary-soft text-primary'
        : 'text-ink-muted hover:bg-primary-soft hover:text-primary'
    }`

  const bottomLink = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 rounded-btn py-2 text-[11px] font-medium transition ${
      isActive ? 'text-primary' : 'text-ink-muted'
    }`

  return (
    <div className="min-h-screen bg-bg">
      <header className="glass fixed inset-x-0 top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Logo doubles as the way back to the landing page */}
            <Link
              to="/"
              aria-label={ta.common.backToSite}
              title={ta.common.backToSite}
              className="inline-flex items-center gap-2 font-semibold tracking-tight text-ink"
            >
              <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="rgb(var(--c-primary))" />
                <path d="M11 8v13h10v-3h-6.5V8H11z" fill="#fff" />
                <circle cx="23" cy="10" r="3" fill="rgb(var(--c-success))" />
              </svg>
              <span className="hidden text-[17px] sm:inline">laborlink</span>
            </Link>
            {!isSupabaseConfigured && (
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                {ta.common.demoBadge}
              </span>
            )}
          </div>

          <nav aria-label="App" className="hidden items-center gap-1 lg:flex">
            {tabs.map((tab) => (
              <NavLink key={tab.to} to={tab.to} className={topLink}>
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <NavLink
              to="/app/alerts"
              aria-label={ta.tabs.alerts}
              title={ta.tabs.alerts}
              className={({ isActive }) =>
                `relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-primary-soft hover:text-primary ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-ink-muted'
                }`
              }
            >
              <Bell size={17} aria-hidden="true" />
              {unread && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"
                />
              )}
            </NavLink>
            <div className="hidden md:block">
              <LangToggle />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-24 sm:px-6 lg:pb-16">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="App"
        className="glass fixed inset-x-0 bottom-0 z-40 border-t lg:hidden"
      >
        <div className="mx-auto flex max-w-content items-stretch px-2 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink key={tab.to} to={tab.to} className={bottomLink}>
                <Icon size={19} aria-hidden="true" />
                {tab.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
