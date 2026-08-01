import type { Metadata } from "next";
import Link from "next/link";
import { JobCard, type JobCardData } from "@/components/jobs/JobCard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  alternates: { canonical: "/jobs" },
  openGraph: { url: "/jobs", type: "website" },
  title: "Jobs",
  description:
    "Werkstudent, Minijob, and short-term roles — every listing states its hours and pay against the legal limits.",
};

const typeFilters = [
  { value: "", label: "All types" },
  { value: "werkstudent", label: "Werkstudent" },
  { value: "minijob", label: "Minijob" },
  { value: "kurzfristig", label: "Short-term" },
] as const;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; remote?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const type = ["werkstudent", "minijob", "kurzfristig"].includes(params.type ?? "")
    ? (params.type as "werkstudent" | "minijob" | "kurzfristig")
    : null;
  const remoteOnly = params.remote === "1";

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "slug, title, type, city, remote, hourly_wage_cents, hours_per_week, employers(name)",
    )
    .eq("status", "active")
    .order("published_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (type) query = query.eq("type", type);
  if (remoteOnly) query = query.eq("remote", true);

  const { data: listings } = await query;

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

  const pillHref = (nextType: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (nextType) p.set("type", nextType);
    if (remoteOnly) p.set("remote", "1");
    const s = p.toString();
    return s ? `/jobs?${s}` : "/jobs";
  };

  const remoteHref = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (!remoteOnly) p.set("remote", "1");
    const s = p.toString();
    return s ? `/jobs?${s}` : "/jobs";
  };

  return (
    <div className="bg-paper text-void" data-ground="paper">
      {/* Black band; the search bar sits half out of it (Absolventa cue). */}
      <section className="bg-void pb-10 text-paper">
        <div className="mx-auto max-w-7xl px-6 pt-16 lg:px-10">
          <p className="eyebrow text-signal">Jobs</p>
          <h1 className="mt-4 font-display text-display-l sm:text-display-xl">
            Every listing shows its limits.
          </h1>
        </div>
      </section>
      <div className="mx-auto -mt-8 max-w-7xl px-6 lg:px-10">
        <form
          action="/jobs"
          method="get"
          role="search"
          className="flex flex-col gap-3 border border-void bg-paper p-3 rounded-r shadow-[0_2px_0_0_var(--color-void)] sm:flex-row"
        >
          <label htmlFor="job-search" className="sr-only">
            Search jobs by title
          </label>
          <input
            id="job-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by title — e.g. data, barista, tutor"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 outline-none placeholder:text-smoke"
          />
          {type ? <input type="hidden" name="type" value={type} /> : null}
          {remoteOnly ? <input type="hidden" name="remote" value="1" /> : null}
          <button
            type="submit"
            className="rounded-r border border-void bg-signal px-6 py-2.5 font-medium text-void transition-colors duration-200 hover:bg-void hover:text-signal"
          >
            Search
          </button>
        </form>
      </div>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          {typeFilters.map((f) => {
            const active = (type ?? "") === f.value;
            return (
              <Link
                key={f.value}
                href={pillHref(f.value)}
                aria-current={active ? "true" : undefined}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-void bg-void text-paper"
                    : "border-hairline text-void hover:border-void"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
          <Link
            href={remoteHref()}
            aria-current={remoteOnly ? "true" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              remoteOnly
                ? "border-void bg-void text-paper"
                : "border-hairline text-void hover:border-void"
            }`}
          >
            Remote possible
          </Link>
        </div>

        <p className="mt-8 font-mono text-sm tabular-nums text-smoke">
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          {q ? ` for “${q}”` : ""}
        </p>

        {jobs.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.slug} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-6 max-w-[50ch] border border-hairline p-8 rounded-r">
            <h2 className="font-display text-xl font-semibold">
              No jobs match.
            </h2>
            <p className="mt-3 text-smoke">
              Remove a filter or search for a shorter word. New roles are
              posted by employers directly, so the list changes often.
            </p>
            <p className="mt-5">
              <Link href="/jobs" className="link-grow font-medium text-void">
                Clear all filters
              </Link>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
