import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { Logo } from './ui/Logo'
import { LangToggle } from './ui/LangToggle'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t py-16">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              {t.footer.tagline}
            </p>
          </div>

          {t.footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-ink-muted transition hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-ink-muted transition hover:text-primary"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-sm font-semibold">{t.footer.languageTitle}</h3>
            <div className="mt-4">
              <LangToggle />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t pt-8 text-xs text-ink-muted sm:flex-row">
          <p>{t.footer.copyright}</p>
          <p>{t.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  )
}
