import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Companies",
  description: "Employers hiring students through LaborLink.",
};

export default async function CompaniesPage() {
  const supabase = await createClient();
  // The count respects RLS: anon sees active listings only.
  const { data: employers } = await supabase
    .from("employers")
    .select("name, slug, city, description, listings(count)")
    .order("name");

  const rows = (employers ?? []).map((e) => ({
    ...e,
    openRoles: e.listings?.[0]?.count ?? 0,
  }));

  return (
    <div className="bg-paper text-void" data-ground="paper">
      <section className="bg-void text-paper">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <p className="eyebrow text-signal">Companies</p>
          <h1 className="mt-4 font-display text-display-l">
            Who is hiring here.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {rows.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((e) => (
              <Link
                key={e.slug}
                href={`/companies/${e.slug}`}
                className="card-lift block border border-hairline bg-paper p-6 rounded-r"
              >
                <h2 className="font-display text-xl font-semibold">{e.name}</h2>
                <p className="mt-1 text-smoke">{e.city}</p>
                {e.description ? (
                  <p className="mt-4 line-clamp-3 text-smoke">{e.description}</p>
                ) : null}
                <p className="mt-5 border-t border-hairline pt-4 font-mono text-sm tabular-nums">
                  {e.openRoles} open {e.openRoles === 1 ? "role" : "roles"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="max-w-[50ch] text-body-l text-smoke">
            No companies yet. Employers appear here when they publish their
            first listing.
          </p>
        )}
      </section>
    </div>
  );
}
