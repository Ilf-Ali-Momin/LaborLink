import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'
import { Logo } from './ui/Logo'
import { LangToggle } from './ui/LangToggle'
import { ThemeToggle } from './ui/ThemeToggle'
import { ButtonRouterLink } from './ui/Button'

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Sticky floating glass pill with links, toggles and session aware CTAs. */
export function Nav() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClasses =
    'rounded-full px-3.5 py-2 text-sm font-medium text-ink-muted transition hover:bg-primary-soft hover:text-primary'

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto max-w-content">
        <nav
          aria-label="Main"
          className="glass flex items-center justify-between rounded-full py-2 pl-5 pr-2 shadow-card"
        >
          <Logo />

          <div className="hidden items-center lg:flex">
            {t.nav.links.map((link) => (
              <a key={link.href} href={link.href} className={linkClasses}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <LangToggle />
            <ThemeToggle />
            {session ? (
              /* Account icon: straight to the profile */
              <Link
                to="/app/profile"
                aria-label={t.nav.account}
                title={t.nav.account}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-card transition hover:bg-primary-deep motion-safe:hover:-translate-y-0.5"
              >
                {initials(session.name)}
              </Link>
            ) : (
              <>
                <ButtonRouterLink to="/login" variant="ghost" className="px-4 py-2">
                  {t.nav.signIn}
                </ButtonRouterLink>
                <ButtonRouterLink to="/onboarding" className="px-4 py-2">
                  {t.nav.getStarted}
                </ButtonRouterLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-primary-soft"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {open && (
          <div
            id="mobile-menu"
            className="glass mt-2 flex flex-col gap-1 rounded-card p-4 shadow-card lg:hidden"
          >
            {session && (
              <>
                <Link
                  to="/app/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-btn px-3 py-2.5 transition hover:bg-primary-soft"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                  >
                    {initials(session.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {session.name}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {t.nav.account}
                    </span>
                  </span>
                </Link>
                <div className="my-2 border-t" />
              </>
            )}

            {t.nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-btn px-3 py-2.5 font-medium text-ink transition hover:bg-primary-soft hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 border-t" />
            <div className="flex items-center justify-between px-3 py-1">
              <LangToggle />
            </div>
            {!session && (
              <div className="mt-2 flex flex-col gap-2">
                <ButtonRouterLink
                  to="/login"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t.nav.signIn}
                </ButtonRouterLink>
                <ButtonRouterLink to="/onboarding" onClick={() => setOpen(false)}>
                  {t.nav.getStarted}
                </ButtonRouterLink>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
