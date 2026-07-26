import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobCard, type JobCardData } from "@/components/jobs/JobCard";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("employers")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.name ?? "Company not found" };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: employer } = await supabase
    .from("employers")
    .select(
      "name, slug, city, website, description, listings(slug, title, type, city, remote, hourly_wage_cents, hours_per_week, status)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!employer) notFound();

  const jobs: JobCardData[] = (employer.listings ?? [])
    .filter((l) => l.status === "active")
    .map((l) => ({
      slug: l.slug,
      title: l.title,
      type: l.type,
      city: l.city,
      remote: l.remote,
      hourly_wage_cents: l.hourly_wage_cents,
      hours_per_week: Number(l.hours_per_week),
      employerName: employer.name,
    }));

  return (
    <div className="bg-paper text-void" data-ground="paper">
      <section className="bg-void text-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <Link href="/companies" className="link-grow text-sm text-paper/70">
            All companies
          </Link>
          <h1 className="mt-6 font-display text-display-l">{employer.name}</h1>
          <p className="mt-3 text-paper/70">
            {employer.city}
            {employer.website ? (
              <>
                {" · "}
                <a
                  href={employer.website}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="link-grow text-paper"
                >
                  Website
                </a>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {employer.description ? (
          <p className="max-w-[70ch] text-body-l leading-relaxed">
            {employer.description}
          </p>
        ) : null}

        <h2 className="mt-14 font-display text-display-m">
          Open roles.
        </h2>
        {jobs.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.slug} job={job} />
            ))}
          </div>
        ) : (
          <p className="mt-6 max-w-[50ch] text-smoke">
            No open roles right now. Check the{" "}
            <Link href="/jobs" className="link-grow text-void">
              full job list
            </Link>{" "}
            for other companies.
          </p>
        )}
      </section>
    </div>
  );
}
