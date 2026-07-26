import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LimitMeter } from "@/components/ui/LimitMeter";
import { TypeChip } from "@/components/ui/StatusChip";
import { ButtonLink } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { applyToListing } from "@/app/actions/applications";
import {
  complianceReadForListing,
  formatEurCents,
  formatHours,
} from "@/lib/compliance/logic";
import {
  MINIJOB_MONTHLY_CEILING,
  WERKSTUDENT_WEEKLY_HOURS,
} from "@/lib/compliance/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("title, employers(name)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return { title: "Job not found" };
  return { title: `${data.title} at ${data.employers?.name}` };
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ applied?: string; error?: string }>;
}) {
  const [{ slug }, notice] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, slug, title, type, description, city, remote, hourly_wage_cents, hours_per_week, published_at, employers(name, slug, city, description)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!listing) notFound();

  const session = await getSessionProfile();
  const hours = Number(listing.hours_per_week);
  const read = complianceReadForListing({
    type: listing.type,
    hoursPerWeek: hours,
    hourlyWageCents: listing.hourly_wage_cents,
  });
  const monthlyEur = (listing.hourly_wage_cents / 100) * hours * 4.33;

  let existingApplication: { status: string } | null = null;
  if (session?.role === "student") {
    const { data } = await supabase
      .from("applications")
      .select("status")
      .eq("listing_id", listing.id)
      .eq("student_id", session.userId)
      .maybeSingle();
    existingApplication = data;
  }

  return (
    <div className="bg-paper text-void" data-ground="paper">
      <section className="bg-void text-paper">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <Link href="/jobs" className="link-grow text-sm text-paper/70">
            All jobs
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <TypeChip type={listing.type} ground="void" />
            {listing.remote ? (
              <span className="text-sm text-paper/60">Remote possible</span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-[24ch] font-display text-display-l">
            {listing.title}
          </h1>
          <p className="mt-4 text-body-l text-paper/70">
            <Link
              href={`/companies/${listing.employers?.slug}`}
              className="link-grow text-paper"
            >
              {listing.employers?.name}
            </Link>
            {listing.city ? ` · ${listing.city}` : ""}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1fr_400px] lg:px-10">
        <article className="max-w-[70ch]">
          {listing.description.split("\n\n").map((block, i) => {
            const lines = block.split("\n");
            const bullets = lines.filter((l) => l.startsWith("- "));
            const text = lines.filter((l) => !l.startsWith("- ")).join(" ");
            return (
              <div key={i} className="mt-5 first:mt-0">
                {text ? (
                  <p className="text-body-l font-medium leading-relaxed">
                    {text}
                  </p>
                ) : null}
                {bullets.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-body-l">
                    {bullets.map((line, j) => (
                      <li key={j}>{line.replace(/^- /, "")}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          {/* The compliance read for this specific role. */}
          <div className="border border-void p-6 rounded-r">
            <p className="eyebrow text-signal-dk">The compliance read</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Wage</dt>
                <dd className="font-mono tabular-nums">
                  {formatEurCents(listing.hourly_wage_cents)}/h
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Hours</dt>
                <dd className="font-mono tabular-nums">{formatHours(hours)} h/week</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Est. monthly gross</dt>
                <dd className="font-mono tabular-nums">
                  €{monthlyEur.toFixed(0)}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              {listing.type === "werkstudent" ? (
                <LimitMeter
                  value={hours}
                  limit={WERKSTUDENT_WEEKLY_HOURS.value}
                  unit="h"
                  label="Hours vs. lecture-period cap"
                  scale="strip"
                />
              ) : listing.type === "minijob" ? (
                <LimitMeter
                  value={Math.round(monthlyEur)}
                  limit={MINIJOB_MONTHLY_CEILING.value}
                  unit="€"
                  label="Earnings vs. Minijob ceiling"
                  scale="strip"
                />
              ) : null}
            </div>

            <ul className="mt-6 space-y-3 border-t border-hairline pt-5 text-sm">
              {read.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link href="/compliance" className="link-grow font-medium text-void">
                How these rules work
              </Link>
            </p>
          </div>

          {/* Apply. States: anon / student new / student applied / employer. */}
          <div className="border border-hairline p-6 rounded-r">
            {notice.applied ? (
              <p className="font-medium">
                Application sent. Track it in your{" "}
                <Link href="/dashboard/applications" className="link-grow">
                  applications
                </Link>
                .
              </p>
            ) : existingApplication ? (
              <p className="font-medium">
                You applied to this role. Status:{" "}
                <span className="text-smoke">{existingApplication.status.replace("_", " ")}</span>
              </p>
            ) : !session ? (
              <>
                <p className="text-smoke">
                  Create a free profile to apply. It takes a few minutes.
                </p>
                <div className="mt-4">
                  <ButtonLink href="/signup" className="w-full">
                    Create profile
                  </ButtonLink>
                </div>
                <p className="mt-3 text-center text-sm text-smoke">
                  Already here?{" "}
                  <Link href="/login" className="link-grow text-void">
                    Log in
                  </Link>
                </p>
              </>
            ) : session.role === "employer" ? (
              <p className="text-smoke">
                You are signed in as an employer. Only students can apply.
              </p>
            ) : (
              <form action={applyToListing} className="space-y-4">
                <input type="hidden" name="listing_id" value={listing.id} />
                <input type="hidden" name="slug" value={listing.slug} />
                {notice.error === "consent" ? (
                  <p className="text-sm text-over">
                    Tick the sharing box to send your application.
                  </p>
                ) : notice.error === "duplicate" ? (
                  <p className="text-sm text-over">
                    You already applied to this role.
                  </p>
                ) : notice.error === "failed" ? (
                  <p className="text-sm text-over">
                    Sending failed. Try again. If it fails twice, contact us.
                  </p>
                ) : null}
                <div>
                  <label htmlFor="apply-message" className="text-sm font-medium">
                    Message to {listing.employers?.name} (optional)
                  </label>
                  <textarea
                    id="apply-message"
                    name="message"
                    rows={4}
                    maxLength={2000}
                    className="mt-1.5 w-full border border-hairline bg-paper p-3 rounded-r outline-none focus:border-void"
                    placeholder="Why this role fits you. Two or three sentences are enough."
                  />
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" name="consent" className="mt-0.5 accent-[var(--color-signal-dk)]" />
                  <span>
                    Share my profile details (name, university, degree,
                    languages, city) and my work-authorization status with
                    this employer, for this application.
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-r border border-void bg-signal px-6 py-3 font-medium text-void transition-colors duration-200 hover:bg-void hover:text-signal"
                >
                  Send application
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
