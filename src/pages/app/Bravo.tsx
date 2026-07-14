import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '../../lib/i18n'

/** Success screen after submitting a proposal (the Figma "Bravo!" frame). */
export function Bravo() {
  const { ta } = useI18n()
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  const jobInfo = location.state as {
    jobTitle?: string
    employer?: string
  } | null

  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary to-primary-deep px-6 py-16 text-center text-white shadow-card-hover md:py-20">
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {reduceMotion ? (
              <path d="M4 13l5 5L20 6" />
            ) : (
              <motion.path
                d="M4 13l5 5L20 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              />
            )}
          </svg>
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight">{ta.bravo.title}</h1>
        {jobInfo?.jobTitle && (
          <p className="mt-2 text-sm font-medium text-white/80">
            {jobInfo.jobTitle}
            {jobInfo.employer ? ` · ${jobInfo.employer}` : ''}
          </p>
        )}
        <p className="mx-auto mt-4 max-w-md text-white/85">{ta.bravo.body}</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app/proposals"
            className="rounded-btn bg-white px-6 py-3 text-sm font-semibold text-primary shadow-card transition hover:bg-primary-soft motion-safe:hover:-translate-y-0.5"
          >
            {ta.bravo.viewProposals}
          </Link>
          <Link
            to="/app/jobs"
            className="rounded-btn border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 motion-safe:hover:-translate-y-0.5"
          >
            {ta.bravo.backToJobs}
          </Link>
        </div>
      </div>
    </div>
  )
}
