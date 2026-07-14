import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Info,
  ShieldCheck,
} from 'lucide-react'
import { useAuth, type Role } from '../../lib/auth'
import { useI18n } from '../../lib/i18n'
import { Logo } from '../../components/ui/Logo'
import { LangToggle } from '../../components/ui/LangToggle'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Tab = 'signin' | 'signup'

export function Login() {
  const { t, ta } = useI18n()
  const {
    mode,
    session,
    loading,
    signInDemo,
    signInSupabase,
    signUpSupabase,
    setRole,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  // Role carried over from a landing page selection ("I am looking for
  // work" / "I am hiring students"). When present, credentials are ALWAYS
  // asked for, even with an existing session.
  const roleParam = params.get('role')
  const roleIntent: Role | null =
    roleParam === 'student' || roleParam === 'employer' ? roleParam : null

  const [tab, setTab] = useState<Tab>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const finishing = useRef(false)

  useEffect(() => {
    if (loading || !session || finishing.current) return
    // Explicit role selection: wait for the form to be submitted.
    if (roleIntent && !submitted) return
    finishing.current = true

    const finish = async () => {
      if (roleIntent) {
        try {
          await setRole(roleIntent)
        } catch {
          /* role stays unset; onboarding will ask again */
        }
        navigate('/app', { replace: true })
        return
      }
      // Plain sign in: back to where they came from, or the landing page,
      // which now shows the account icon in its nav.
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/', { replace: true })
    }
    void finish()
  }, [loading, session, submitted, roleIntent, navigate, location.state, setRole])

  const isLive = mode === 'supabase'
  const needsName = !isLive || tab === 'signup'

  const validate = (): boolean => {
    if (needsName && !name.trim()) {
      setError(ta.login.errorName)
      return false
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(ta.login.errorEmail)
      return false
    }
    if (isLive && password.length < 8) {
      setError(ta.login.errorPassword)
      return false
    }
    return true
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!validate()) return

    if (!isLive) {
      signInDemo(name.trim(), email.trim())
      setSubmitted(true)
      return
    }

    setBusy(true)
    try {
      if (tab === 'signin') {
        const err = await signInSupabase(email.trim(), password)
        if (err) setError(err)
        else setSubmitted(true)
      } else {
        const result = await signUpSupabase(
          name.trim(),
          email.trim(),
          password,
          roleIntent,
        )
        if (result.error) {
          setError(result.error)
        } else if (result.needsConfirmation) {
          setNotice(ta.login.confirmNotice)
          setTab('signin')
        } else {
          setSubmitted(true)
        }
      }
    } finally {
      setBusy(false)
    }
  }

  const field =
    'mt-1.5 w-full rounded-btn border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60'

  return (
    <div className="hero-wash flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-card p-8 shadow-card">
        <div className="flex items-center justify-between">
          <Logo />
          <LangToggle />
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight">{ta.login.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{ta.login.sub}</p>

        {roleIntent && (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary">
            {roleIntent === 'student' ? (
              <GraduationCap size={14} aria-hidden="true" />
            ) : (
              <Building2 size={14} aria-hidden="true" />
            )}
            {roleIntent === 'student' ? t.hero.ctaStudent : t.hero.ctaEmployer}
          </span>
        )}

        {isLive && (
          <div
            role="group"
            aria-label={ta.login.title}
            className="mt-6 flex rounded-full border bg-surface/60 p-0.5"
          >
            {(['signin', 'signup'] as Tab[]).map((tabOption) => (
              <button
                key={tabOption}
                type="button"
                aria-pressed={tab === tabOption}
                onClick={() => {
                  setTab(tabOption)
                  setError(null)
                }}
                className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  tab === tabOption
                    ? 'bg-primary text-white'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tabOption === 'signin' ? ta.login.signInTab : ta.login.signUpTab}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {needsName && (
            <div>
              <label htmlFor="login-name" className="text-sm font-semibold">
                {ta.login.nameLabel}
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ta.login.namePlaceholder}
                className={field}
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="text-sm font-semibold">
              {ta.login.emailLabel}
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ta.login.emailPlaceholder}
              className={field}
              autoComplete="email"
            />
          </div>
          {isLive && (
            <div>
              <label htmlFor="login-password" className="text-sm font-semibold">
                {ta.login.passwordLabel}
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={ta.login.passwordPlaceholder}
                className={field}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-primary">
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-btn bg-success/10 p-3 text-sm font-medium text-success"
            >
              <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-card transition enabled:hover:bg-primary-deep enabled:motion-safe:hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
          >
            {isLive && tab === 'signup' ? ta.login.signUpTab : ta.login.continueBtn}
          </button>
        </form>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {isLive ? ta.login.liveNote : ta.login.demoNote}
        </p>
      </div>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {ta.common.backToSite}
      </Link>
    </div>
  )
}
