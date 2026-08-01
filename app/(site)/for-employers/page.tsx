import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { LimitMeter } from "@/components/ui/LimitMeter";
import { Seam } from "@/components/ui/Seam";
import { Reveal } from "@/components/motion/Reveal";
import {
  MINIJOB_MONTHLY_CEILING,
  WERKSTUDENT_WEEKLY_HOURS,
} from "@/lib/compliance/config";

export const metadata: Metadata = {
  alternates: { canonical: "/for-employers" },
  openGraph: { url: "/for-employers", type: "website" },
  title: "For employers",
  description:
    "Hire Werkstudenten and Minijobbers without breaking labor law. Listings checked against the legal limits, applicants with clear work-authorization answers.",
};

/**
 * Employer side: same components, opposite ground (white-dominant).
 * A user always knows which side of the product they stand on.
 */
export default function ForEmployersPage() {
  return (
    <div className="bg-paper text-void" data-ground="paper">
      <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-10 lg:pt-24">
        <div>
          <p className="eyebrow hero-rise text-signal-dk" style={{ "--d": "0ms" } as React.CSSProperties}>
            For employers
          </p>
          <h1 className="mt-6 font-display text-[3.4rem] font-bold leading-[0.95] tracking-[-0.03em] sm:text-display-xl">
            <span className="hero-line-mask">
              <span className="hero-line block" style={{ "--d": "60ms" } as React.CSSProperties}>
                Hire students.
              </span>
            </span>
            <span className="hero-line-mask">
              <span className="hero-line block" style={{ "--d": "120ms" } as React.CSSProperties}>
                Keep it legal.
              </span>
            </span>
          </h1>
          <p
            className="hero-rise mt-8 max-w-[60ch] text-body-l text-smoke"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            Werkstudent status saves you the full social security load — until
            an hour limit slips and the contributions come back, with
            interest, in an audit. LaborLink checks every listing against the
            legal limits before it goes live and brings you applicants who fit
            the rules.
          </p>
          <div
            className="hero-rise mt-10 flex flex-wrap items-center gap-6"
            style={{ "--d": "380ms" } as React.CSSProperties}
          >
            <ButtonLink href="/signup?role=employer" size="lg">
              Post a job
            </ButtonLink>
            <Link href="/pricing" className="link-grow text-void">
              See pricing
            </Link>
          </div>
        </div>

        <div className="hero-rise" style={{ "--d": "240ms" } as React.CSSProperties}>
          <div className="border border-hairline bg-paper p-6 rounded-r shadow-none sm:p-8">
            <p className="eyebrow text-smoke">Listing check — example</p>
            <h2 className="mt-3 font-display text-xl font-semibold">
              Working student: data engineering
            </h2>
            <div className="mt-6">
              <LimitMeter
                value={18}
                limit={WERKSTUDENT_WEEKLY_HOURS.value}
                unit="h"
                label="Offered hours vs. legal cap"
                scale="strip"
              />
            </div>
            <dl className="mt-6 space-y-3 border-t border-hairline pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Work authorization</dt>
                <dd className="font-medium">Answered yes / no — never the document</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Contract type fits the hours</dt>
                <dd className="font-mono tabular-nums">18 ≤ {WERKSTUDENT_WEEKLY_HOURS.value} h</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <Seam from="var(--color-paper)" to="var(--color-void)" />

      {/* What exists today vs. what is coming — no invented features. */}
      <section className="bg-void text-paper">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <Reveal>
            <p className="eyebrow text-signal">What you get today</p>
            <h2 className="mt-4 max-w-[22ch] font-display text-display-l">
              The marketplace now. The back office next.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delayMs={i * 80}>
                <div className="border-t-2 border-ash pt-5">
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-3 text-paper/70">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <div className="border border-ash bg-ash/50 p-6 rounded-r">
              <p className="eyebrow text-paper/60">On the roadmap, stated honestly</p>
              <p className="mt-3 max-w-[70ch] text-paper/80">
                Hour tracking against contracts, automated Werkstudent
                compliance checks, and payroll documentation are phase two.
                They are being built on this same data model — but they are
                not live yet, and we will not pretend otherwise.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Seam from="var(--color-void)" to="var(--color-paper)" />

      <section className="bg-paper text-void">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 py-16 lg:px-10">
          <div>
            <h2 className="font-display text-display-m">
              One active listing is free.
            </h2>
            <p className="mt-3 max-w-[50ch] text-smoke">
              Post your first role today. Upgrade when you need more listings
              or a team inbox.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <ButtonLink href="/signup?role=employer">Create employer account</ButtonLink>
            <Link href="/pricing" className="link-grow text-void">
              Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Listings checked before they go live",
    body: `A Werkstudent role above ${WERKSTUDENT_WEEKLY_HOURS.value} hours a week, or a Minijob that pays past €${MINIJOB_MONTHLY_CEILING.value} a month, is flagged while you type — not by a lawyer after you hire.`,
  },
  {
    title: "Applicants who fit the rules",
    body: "Every application answers work authorization for this role with a clear yes or no, computed on our side. You never handle a permit document, so you never hold that liability.",
  },
  {
    title: "A consented snapshot, not a database",
    body: "You see exactly the fields the student chose to share for this application. Clean under GDPR, and honest toward the person you might hire.",
  },
];
