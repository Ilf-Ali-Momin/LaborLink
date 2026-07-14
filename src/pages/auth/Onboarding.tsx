import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2, CircleCheck, GraduationCap } from 'lucide-react'
import { useAuth, type Role } from '../../lib/auth'
import { useI18n } from '../../lib/i18n'
import { Logo } from '../../components/ui/Logo'

export function Onboarding() {
  const { ta } = useI18n()
  const { session, loading, setRole } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Role | null>(session?.role ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />

  const options = [
    {
      role: 'student' as Role,
      icon: GraduationCap,
      ...ta.onboarding.student,
    },
    {
      role: 'employer' as Role,
      icon: Building2,
      ...ta.onboarding.employer,
    },
  ]

  const onContinue = async () => {
    if (!selected || busy) return
    setBusy(true)
    setError(null)
    try {
      await setRole(selected)
      navigate('/app', { replace: true })
    } catch {
      setError(ta.common.genericError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hero-wash flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Logo />

      <div className="mt-8 w-full max-w-2xl text-center">
        <span className="glass inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {ta.onboarding.kicker}
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
          {ta.onboarding.title}
        </h1>
        <p className="mt-3 text-ink-muted">{ta.onboarding.sub}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon
            const active = selected === option.role
            return (
              <button
                key={option.role}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(option.role)}
                className={`glass rounded-card p-6 text-left shadow-card transition motion-safe:hover:-translate-y-0.5 ${
                  active ? 'ring-2 ring-primary' : 'hover:shadow-card-hover'
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-btn ${
                    active ? 'bg-primary text-white' : 'bg-primary-soft text-primary'
                  }`}
                >
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-semibold">{option.title}</h2>
                <p className="mt-1 text-sm text-ink-muted">{option.sub}</p>
                <ul className="mt-4 space-y-2">
                  {option.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm">
                      <CircleCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {error && (
          <p role="alert" className="mt-6 text-sm font-medium text-primary">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={!selected || busy}
          className="mt-8 w-full max-w-xs rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-card transition enabled:hover:bg-primary-deep enabled:motion-safe:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {ta.onboarding.continueBtn}
        </button>
      </div>
    </div>
  )
}
