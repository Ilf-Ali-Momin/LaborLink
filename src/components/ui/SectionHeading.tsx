import { Reveal } from './Reveal'

/** Centered kicker pill + H2 + subline used by every major section. */
export function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string
  title: string
  sub?: string
}) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <span className="glass inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        {kicker}
      </span>
      <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight md:text-[40px]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base text-ink-muted md:text-lg">{sub}</p>}
    </Reveal>
  )
}
