import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { Logo } from '../components/ui/Logo'

export function NotFound() {
  const { ta } = useI18n()

  return (
    <div className="hero-wash flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <p className="mt-10 text-7xl font-bold tracking-tight text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{ta.notFound.title}</h1>
      <p className="mt-2 max-w-sm text-ink-muted">{ta.notFound.body}</p>
      <Link
        to="/"
        className="mt-8 rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-primary-deep motion-safe:hover:-translate-y-0.5"
      >
        {ta.notFound.home}
      </Link>
    </div>
  )
}
