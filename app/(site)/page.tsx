import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { LimitMeter } from "@/components/ui/LimitMeter";
import { Seam } from "@/components/ui/Seam";
import { Reveal } from "@/components/motion/Reveal";
import { JobCard, type JobCardData } from "@/components/jobs/JobCard";
import { createClient } from "@/lib/supabase/server";
import {
  MINIJOB_MONTHLY_CEILING,
  STUDENT_PERMIT_FULL_DAYS_PER_YEAR,
  WERKSTUDENT_WEEKLY_HOURS,
} from "@/lib/compliance/config";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select(
      "slug, title, type, city, remote, hourly_wage_cents, hours_per_week, employers(name)",
    )
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(3);

  const jobs: JobCardData[] = (listings ?? []).map((l) => ({
    slug: l.slug,
    title: l.title,
    type: l.type,
    city: l.city,
    remote: l.remote,
    hourly_wage_cents: l.hourly_wage_cents,
    hours_per_week: Number(l.hours_per_week),
    employerName: l.employers?.name ?? "",
  }));

  return (
    <div className="bg-void text-paper">
      {/* Hero — the only page-load animation on the site. */}
      <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-10 lg:pt-24">
        <div>
          <p className="eyebrow hero-rise text-signal" style={{ "--d": "0ms" } as React.CSSProperties}>
            Student jobs in Germany
          </p>
          <h1 className="mt-6 font-display text-[3.4rem] font-bold leading-[0.95] tracking-[-0.03em] sm:text-display-xl">
            <span className="hero-line-mask">
              <span className="hero-line block" style={{ "--d": "60ms" } as React.CSSProperties}>
                Find work.
              </span>
            </span>
            <span className="hero-line-mask">
              <span className="hero-line block" style={{ "--d": "120ms" } as React.CSSProperties}>
                Stay legal.
              </span>
            </span>
          </h1>
          <p
            className="hero-rise mt-8 max-w-[60ch] text-body-l text-paper/80"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            A Werkstudent contract stops at {WERKSTUDENT_WEEKLY_HOURS.value}{" "}
            hours a week. A Minijob stops at €{MINIJOB_MONTHLY_CEILING.value} a
            month. A residence permit adds its own numbers. LaborLink shows you
            jobs that fit inside your limits, and tracks your hours so you stay
            inside them.
          </p>
          <div
            className="hero-rise mt-10 flex flex-wrap items-center gap-6"
            style={{ "--d": "380ms" } as React.CSSProperties}
          >
            <ButtonLink href="/jobs" size="lg">
              Browse jobs
            </ButtonLink>
            <Link href="/compliance" className="link-grow text-paper">
              How the rules work
            </Link>
          </div>
        </div>

        {/* Product evidence, not a stock photo: the limit meter itself. */}
        <div className="hero-rise" style={{ "--d": "240ms" } as React.CSSProperties}>
          <div className="border border-ash bg-ash/60 p-6 rounded-r sm:p-8">
            <LimitMeter
              value={14.5}
              limit={WERKSTUDENT_WEEKLY_HOURS.value}
              unit="h"
              label="This week"
              sublabel="Example week during the lecture period"
              scale="hero"
              ground="void"
            />
            <ul className="mt-8 space-y-3 border-t border-ash pt-6 font-mono text-sm tabular-nums text-paper/70">
              <li className="flex justify-between">
                <span>Mon — warehouse shift</span>
                <span>4.0 h</span>
              </li>
              <li className="flex justify-between">
                <span>Wed — office</span>
                <span>6.0 h</span>
              </li>
              <li className="flex justify-between">
                <span>Fri — office</span>
                <span>4.5 h</span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-paper/60">
              You log hours. The meter shows the line. No spreadsheet, no
              guessing.
            </p>
          </div>
        </div>
      </section>

      {/* The wedge: the line, rendered as geometry. */}
      <div className="hero-wedge" style={{ "--d": "200ms" } as React.CSSProperties}>
        <Seam from="var(--color-void)" to="var(--color-paper)" />
      </div>

      {/* The rules, as hard numbers. */}
      <section className="bg-paper text-void" data-ground="paper">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <Reveal>
            <p className="eyebrow text-signal-dk">Why this exists</p>
            <h2 className="mt-4 max-w-[24ch] font-display text-display-l">
              The limits are invisible until you cross one.
            </h2>
            <p className="mt-6 max-w-[60ch] text-body-l text-smoke">
              Cross a limit and the consequences land on you: back-payments,
              trouble with the Ausländerbehörde, a contract that ends badly.
              These are the three numbers that matter most.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-3">
            <Reveal delayMs={0}>
              <RuleFigure
                figure={`${WERKSTUDENT_WEEKLY_HOURS.value} h`}
                title="Werkstudent, per week"
                body="During the lecture period you may work up to 20 hours a week. More, and you lose Werkstudent status — social security contributions come due, retroactively."
                href="/compliance#werkstudent"
              />
            </Reveal>
            <Reveal delayMs={80}>
              <RuleFigure
                figure={`€${MINIJOB_MONTHLY_CEILING.value}`}
                title="Minijob, per month"
                body="Earn more than this in a Minijob and it stops being a Minijob. The ceiling moves with the minimum wage; we keep it current."
                href="/compliance#minijob"
              />
            </Reveal>
            <Reveal delayMs={160}>
              <RuleFigure
                figure={`${STUDENT_PERMIT_FULL_DAYS_PER_YEAR.value} days`}
                title="Student permit, per year"
                body="A §16b residence permit allows 140 full working days a year, or 20 hours a week. Half days count as half. We do the counting."
                href="/compliance#permits"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* How it works. */}
      <section className="bg-void text-paper">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <Reveal>
            <p className="eyebrow text-signal">How it works</p>
            <h2 className="mt-4 font-display text-display-l">
              Four steps. No surprises.
            </h2>
          </Reveal>
          <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.title} delayMs={i * 80}>
                <li className="border-t-2 border-ash pt-5">
                  <span className="font-mono text-sm text-paper/50">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-paper/70">{step.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <Seam from="var(--color-void)" to="var(--color-paper)" direction="down" />

      {/* Real listings from the database — no invented numbers. */}
      <section className="bg-paper text-void" data-ground="paper">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="eyebrow text-signal-dk">Open roles</p>
              <h2 className="mt-4 font-display text-display-l">Open now.</h2>
            </Reveal>
            <ButtonLink href="/jobs" variant="outline-paper">
              See all jobs
            </ButtonLink>
          </div>
          {jobs.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {jobs.map((job, i) => (
                <Reveal key={job.slug} delayMs={i * 80}>
                  <JobCard job={job} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-12 max-w-[50ch] text-body-l text-smoke">
              No open roles right now. New listings appear here as employers
              post them — check back, or create a profile so applying takes a
              minute when they do.
            </p>
          )}
        </div>
      </section>

      {/* Employer cross-link: the other side of the seam. */}
      <section className="border-t border-ash bg-void text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 py-16 lg:px-10">
          <div>
            <h2 className="font-display text-display-m">You hire students.</h2>
            <p className="mt-3 max-w-[50ch] text-paper/70">
              The same rules that worry your students create liability for
              you. LaborLink handles both sides.
            </p>
          </div>
          <ButtonLink href="/for-employers" variant="outline-void">
            For employers
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

const steps = [
  {
    title: "Create your profile",
    body: "Name, university, what you can do. You decide what an employer sees, per application.",
  },
  {
    title: "Set your limits",
    body: "Werkstudent, Minijob, or a permit with a day count. Your dashboard knows which lines apply to you.",
  },
  {
    title: "Apply in minutes",
    body: "Every listing shows its hours and pay against the legal limits before you apply. No surprises in the interview.",
  },
  {
    title: "Log hours. See the line.",
    body: "Log what you work. The meter fills toward the limit and warns you before you reach it — not after.",
  },
];

function RuleFigure({
  figure,
  title,
  body,
  href,
}: {
  figure: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <div>
      <p className="border-b-2 border-signal-dk pb-3 font-mono text-display-m font-medium tabular-nums">
        {figure}
      </p>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-smoke">{body}</p>
      <p className="mt-4">
        <Link href={href} className="link-grow font-medium text-void">
          The full rule
        </Link>
      </p>
    </div>
  );
}
