import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyEmployer } from "@/lib/employer";
import { setListingStatus } from "@/app/actions/listings";
import { listingErrorMessage } from "@/components/employer/ListingForm";
import { TypeChip } from "@/components/ui/StatusChip";
import { formatEurCents, formatHours } from "@/lib/compliance/logic";

export const metadata = { title: "Listings" };

const statusLabel: Record<string, string> = {
  draft: "Draft",
  active: "Live",
  closed: "Closed",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, title, slug, type, status, city, hourly_wage_cents, hours_per_week, published_at, applications(count)",
    )
    .eq("employer_id", employer.id)
    .order("created_at", { ascending: false });

  const error = listingErrorMessage(params.error);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-m">Listings.</h1>
        <Link
          href="/employer/listings/new"
          className="rounded-r bg-signal px-5 py-2.5 font-medium text-void transition-colors duration-200 hover:bg-void hover:text-signal"
        >
          New listing
        </Link>
      </div>

      {error ? <p className="mt-6 border-l-2 border-over pl-4">{error}</p> : null}
      {params.created ? (
        <p className="mt-6 border-l-2 border-signal-dk pl-4">
          Listing created as a draft. Publish it when it is ready.
        </p>
      ) : null}
      {params.saved ? (
        <p className="mt-6 border-l-2 border-signal-dk pl-4">Listing saved.</p>
      ) : null}

      {!listings || listings.length === 0 ? (
        <div className="mt-8 max-w-[55ch] border border-hairline p-8 rounded-r">
          <p className="text-body-l">No listings yet.</p>
          <p className="mt-2 text-smoke">
            Your first listing is checked against the legal limits while you
            create it, and goes live the moment you publish.
          </p>
          <p className="mt-5">
            <Link href="/employer/listings/new" className="link-grow font-medium text-void">
              Create your first listing
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-hairline border border-hairline rounded-r">
          {listings.map((l) => {
            const applicantCount = l.applications?.[0]?.count ?? 0;
            return (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                        l.status === "active"
                          ? "border-signal-dk text-signal-dk"
                          : "border-hairline text-smoke"
                      }`}
                    >
                      {statusLabel[l.status]}
                    </span>
                    <TypeChip type={l.type} />
                  </div>
                  <p className="mt-2 font-display text-lg font-semibold">
                    {l.status === "active" ? (
                      <Link href={`/jobs/${l.slug}`} className="link-grow">
                        {l.title}
                      </Link>
                    ) : (
                      l.title
                    )}
                  </p>
                  <p className="mt-1 font-mono text-sm tabular-nums text-smoke">
                    {formatEurCents(l.hourly_wage_cents)}/h ·{" "}
                    {formatHours(Number(l.hours_per_week))} h/week ·{" "}
                    {applicantCount} {applicantCount === 1 ? "applicant" : "applicants"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/employer/listings/${l.id}/edit`}
                    className="link-grow text-void"
                  >
                    Edit
                  </Link>
                  {l.status !== "active" ? (
                    <form action={setListingStatus}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="status" value="active" />
                      <button
                        type="submit"
                        className="rounded-r border border-void px-4 py-2 text-sm font-medium transition-colors hover:bg-void hover:text-paper"
                      >
                        Publish
                      </button>
                    </form>
                  ) : (
                    <form action={setListingStatus}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="status" value="closed" />
                      <button
                        type="submit"
                        className="rounded-r border border-hairline px-4 py-2 text-sm text-smoke transition-colors hover:border-void hover:text-void"
                      >
                        Close
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
