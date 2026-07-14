import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'

/** Hero: pill label, accented H1, split audience CTAs, embedded search bar. */
export function Hero() {
  const { t } = useI18n()
  const search = t.hero.search

  // The search is a marketing mock: submitting scrolls to the live job grid.
  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
  }

  const fieldLabel =
    'block text-[11px] font-bold uppercase tracking-wider text-ink-muted'
  const fieldInput =
    'w-full bg-transparent text-sm text-ink placeholder:text-ink-muted/60'

  return (
    <section id="home" className="hero-wash relative overflow-hidden pb-24 pt-36 md:pt-44">
      {/* Blurred low opacity gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-24 h-[480px] w-[480px] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -left-48 top-64 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-content px-4 text-center sm:px-6">
        <Reveal>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <ShieldCheck size={15} className="text-success" aria-hidden="true" />
            {t.hero.pill}
          </span>
        </Reveal>

        <Reveal index={1}>
          <h1 className="mx-auto mt-6 max-w-3xl text-[42px] font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[64px]">
            {t.hero.h1Before}
            <em className="font-serif font-normal italic text-primary">
              {t.hero.h1Accent}
            </em>
            {t.hero.h1After}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-muted md:text-lg">
            {t.hero.subhead}
          </p>
        </Reveal>

        {/* Split audience CTAs */}
        <Reveal index={2}>
          <div className="mx-auto mt-9 grid max-w-2xl gap-4 sm:grid-cols-2">
            <Link
              to="/login?role=student"
              className="group flex items-center gap-4 rounded-card bg-primary p-5 text-left text-white shadow-card transition hover:bg-primary-deep hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-white/15">
                <GraduationCap size={22} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{t.hero.ctaStudent}</span>
                <span className="block text-sm text-white/75">
                  {t.hero.ctaStudentSub}
                </span>
              </span>
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="shrink-0 transition group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              to="/login?role=employer"
              className="group glass flex items-center gap-4 rounded-card p-5 text-left shadow-card transition hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-primary-soft text-primary">
                <Building2 size={22} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-ink">
                  {t.hero.ctaEmployer}
                </span>
                <span className="block text-sm text-ink-muted">
                  {t.hero.ctaEmployerSub}
                </span>
              </span>
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="shrink-0 text-primary transition group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        {/* Airbnb style search bar */}
        <Reveal index={3}>
          <form
            onSubmit={onSearch}
            aria-label={search.button}
            className="glass mx-auto mt-8 grid max-w-3xl gap-1 rounded-card p-2 shadow-card sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center sm:rounded-full"
          >
            <div className="px-4 py-2 text-left">
              <label htmlFor="search-role" className={fieldLabel}>
                {search.roleLabel}
              </label>
              <input
                id="search-role"
                name="role"
                type="text"
                placeholder={search.rolePlaceholder}
                className={fieldInput}
              />
            </div>

            <div className="border-t px-4 py-2 text-left sm:border-l sm:border-t-0">
              <label htmlFor="search-city" className={fieldLabel}>
                {search.cityLabel}
              </label>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0 text-ink-muted" aria-hidden="true" />
                <input
                  id="search-city"
                  name="city"
                  type="text"
                  placeholder={search.cityPlaceholder}
                  className={fieldInput}
                />
              </div>
            </div>

            <div className="border-t px-4 py-2 text-left sm:border-l sm:border-t-0">
              <label htmlFor="search-type" className={fieldLabel}>
                {search.typeLabel}
              </label>
              <div className="relative">
                <select
                  id="search-type"
                  name="type"
                  defaultValue={search.types[0]}
                  className={`${fieldInput} appearance-none pr-6`}
                >
                  {search.types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink-muted"
                />
              </div>
            </div>

            <button
              type="submit"
              className="m-1 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-deep motion-safe:hover:-translate-y-0.5"
            >
              <Search size={16} aria-hidden="true" />
              {search.button}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
