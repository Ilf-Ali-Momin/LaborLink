import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import {
  ALL_THRESHOLDS,
  KURZFRISTIG_MAX_MONTHS,
  KURZFRISTIG_MAX_WORKING_DAYS,
  MINIJOB_ANNUAL_CEILING,
  MINIJOB_MONTHLY_CEILING,
  MINIMUM_WAGE,
  STUDENT_PERMIT_FULL_DAYS_PER_YEAR,
  STUDENT_PERMIT_HALF_DAYS_PER_YEAR,
  WERKSTUDENT_OVER20_WEEKS_PER_YEAR,
  WERKSTUDENT_WEEKLY_HOURS,
} from "@/lib/compliance/config";

export const metadata: Metadata = {
  title: "The rules, in plain language",
  description:
    "Werkstudent, Minijob, short-term employment, and residence permits — the German rules for student work, explained in plain words with sources.",
};

/**
 * The trust engine. Every figure on this page comes from
 * lib/compliance/config.ts and is traceable to a dated source.
 */
export default function CompliancePage() {
  return (
    <div className="bg-paper text-void" data-ground="paper">
      <section className="bg-void text-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <p className="eyebrow text-signal">The rules</p>
          <h1 className="mt-4 max-w-[20ch] font-display text-display-l sm:text-display-xl">
            Know the line before you reach it.
          </h1>
          <p className="mt-6 max-w-[60ch] text-body-l text-paper/80">
            Four kinds of student work, four sets of limits. This page says
            what each rule is, what happens if you cross it, and where the
            numbers come from. Short sentences, no legal German. It is
            general information, not legal advice for your case.
          </p>
          <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-3">
            {[
              ["#werkstudent", "Werkstudent"],
              ["#minijob", "Minijob"],
              ["#kurzfristig", "Short-term"],
              ["#permits", "Residence permits"],
              ["#sources", "Sources"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-paper/30 px-4 py-1.5 text-sm text-paper transition-colors hover:border-signal hover:text-signal"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
        <Rule
          id="werkstudent"
          eyebrow="Werkstudent"
          title={`${WERKSTUDENT_WEEKLY_HOURS.value} hours a week. That is the line.`}
        >
          <p>
            As a Werkstudent you work for a company while you are enrolled.
            You pay almost no social security contributions. That advantage
            has one condition: during the lecture period you work at most{" "}
            <Fig>{WERKSTUDENT_WEEKLY_HOURS.value} hours per week</Fig>. All
            your jobs count together, not each one alone.
          </p>
          <p>
            In the lecture-free period you may work more — up to full time.
            You may also go over 20 hours in the evening, at night, or on
            weekends during the semester. But all weeks over 20 hours must
            fit inside <Fig>{WERKSTUDENT_OVER20_WEEKS_PER_YEAR.value} weeks</Fig>{" "}
            (182 days) in a rolling year.
          </p>
          <WhatHappens>
            You lose Werkstudent status. You and your employer owe the full
            social security contributions — looking backward, not just from
            today. Employers get audited on exactly this. Track your hours
            and the problem never starts.
          </WhatHappens>
        </Rule>

        <Rule
          id="minijob"
          eyebrow="Minijob"
          title={`€${MINIJOB_MONTHLY_CEILING.value} a month. Averaged, not eyeballed.`}
        >
          <p>
            A Minijob is tax-simplified work with an earnings ceiling:{" "}
            <Fig>€{MINIJOB_MONTHLY_CEILING.value} per month</Fig>, or{" "}
            <Fig>€{MINIJOB_ANNUAL_CEILING.value.toLocaleString("en-DE")} per year</Fig>.
            The ceiling is tied to the minimum wage — currently{" "}
            <Fig>€{MINIMUM_WAGE.value.toFixed(2)} per hour</Fig> — so at
            minimum wage it equals about 43 hours a month. When the minimum
            wage rises, the ceiling rises with it.
          </p>
          <p>
            You can hold a Minijob next to a Werkstudent job. The hours still
            count toward your {WERKSTUDENT_WEEKLY_HOURS.value}-hour weekly
            limit during the lecture period.
          </p>
          <WhatHappens>
            Earn above the ceiling on average and the job stops being a
            Minijob. It becomes normal employment with full contributions —
            for you and for the employer, backdated to when the ceiling
            broke.
          </WhatHappens>
        </Rule>

        <Rule
          id="kurzfristig"
          eyebrow="Short-term employment"
          title={`${KURZFRISTIG_MAX_MONTHS.value} months or ${KURZFRISTIG_MAX_WORKING_DAYS.value} working days.`}
        >
          <p>
            Short-term employment (kurzfristige Beschäftigung) is for
            genuinely temporary work: festival crews, harvest, trade fairs,
            inventory weeks. No social security contributions, no earnings
            ceiling — but a hard time limit:{" "}
            <Fig>{KURZFRISTIG_MAX_MONTHS.value} months</Fig> or{" "}
            <Fig>{KURZFRISTIG_MAX_WORKING_DAYS.value} working days</Fig> per
            calendar year, added up across all short-term jobs you hold that
            year.
          </p>
          <WhatHappens>
            Pass the limit and the job is treated as regular employment from
            the start. If you are also a Werkstudent, badly-planned
            short-term work can quietly use up your over-20-hours weeks.
          </WhatHappens>
        </Rule>

        <Rule
          id="permits"
          eyebrow="Non-EU students"
          title={`${STUDENT_PERMIT_FULL_DAYS_PER_YEAR.value} full days a year. Half days count as half.`}
        >
          <p>
            If you study in Germany on a §16b residence permit, your permit
            itself limits your work — separately from everything above. You
            may work <Fig>{STUDENT_PERMIT_FULL_DAYS_PER_YEAR.value} full days</Fig>{" "}
            or <Fig>{STUDENT_PERMIT_HALF_DAYS_PER_YEAR.value} half days</Fig>{" "}
            per calendar year without permission from the employment agency.
            A day up to four hours counts as a half day. Working student
            positions of up to 20 hours a week are generally allowed
            alongside this.
          </p>
          <p>
            EU and EEA citizens do not have this limit. For them, only the
            Werkstudent and Minijob rules above apply.
          </p>
          <WhatHappens>
            This is the one that matters most and forgives least: working
            beyond what the permit allows can put the permit itself at risk.
            If you are unsure about your specific case, ask your
            university&apos;s international office or a lawyer — before
            taking the job, not after.
          </WhatHappens>
        </Rule>

        {/* Sources — generated from the config module, never typed by hand. */}
        <section id="sources" className="mt-24 scroll-mt-24 border-t-2 border-void pt-10">
          <h2 className="font-display text-display-m">Sources.</h2>
          <p className="mt-4 max-w-[60ch] text-smoke">
            Every number on this page comes from one config file in our
            codebase, with a source and a verification date. When a rule
            changes, we change it there and it changes everywhere.
          </p>
          <ul className="mt-8 space-y-4">
            {dedupeSources().map((s) => (
              <li key={s.sourceUrl} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-4">
                <a
                  href={s.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="link-grow font-medium text-void"
                >
                  {s.sourceName}
                </a>
                <span className="font-mono text-sm text-smoke">
                  verified {s.lastVerified}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-smoke">
            This page is general information, not legal advice. For a
            decision about your permit or your contract, talk to your
            university&apos;s international office, a Studierendenwerk
            advisor, or a lawyer.
          </p>
          <p className="mt-6">
            <Link href="/jobs" className="link-grow font-medium text-void">
              Browse jobs that state these limits up front
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

function Rule({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="mt-20 scroll-mt-24 first:mt-0">
        <p className="eyebrow text-signal-dk">{eyebrow}</p>
        <h2 className="mt-3 max-w-[24ch] font-display text-display-m">{title}</h2>
        <div className="mt-6 space-y-5 text-body-l leading-relaxed">{children}</div>
      </section>
    </Reveal>
  );
}

/** Measured quantities are set in mono: the system asserts them as fact. */
function Fig({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap font-mono text-[0.95em] font-medium tabular-nums">
      {children}
    </span>
  );
}

function WhatHappens({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-over pl-5 text-base text-void">
      <p className="eyebrow text-over">If you cross it</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

function dedupeSources() {
  const seen = new Set<string>();
  return ALL_THRESHOLDS.filter((t) => {
    if (seen.has(t.sourceUrl)) return false;
    seen.add(t.sourceUrl);
    return true;
  });
}
