import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Logo } from './ui/Logo'
import { LangToggle } from './ui/LangToggle'
import { ThemeToggle } from './ui/ThemeToggle'
import { ButtonRouterLink } from './ui/Button'

/** Sticky floating glass pill with links, DE/EN + theme toggles and CTAs. */
export function Nav() {
  const { t } = useI18n()
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
            <ButtonRouterLink to="/login" variant="ghost" className="px-4 py-2">
              {t.nav.signIn}
            </ButtonRouterLink>
            <ButtonRouterLink to="/onboarding" className="px-4 py-2">
              {t.nav.getStarted}
            </ButtonRouterLink>
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
          </div>
        )}
      </div>
    </header>
  )
}
