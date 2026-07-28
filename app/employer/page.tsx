import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createEmployer } from "@/app/actions/employers";
import { getMyEmployer } from "@/lib/employer";
import { activeListingLimit, effectiveTier } from "@/lib/entitlements";
import { StatusChip } from "@/components/ui/StatusChip";

const inputClass =
  "mt-1.5 w-full border border-hairline bg-paper p-3 rounded-r outline-none focus:border-void";

export default async function EmployerOverview({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const employer = await getMyEmployer();

  if (!employer) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-display-m">
          Set up your company.
        </h1>
        <p className="mt-3 max-w-[55ch] text-smoke">
          This is your public company page. Students see it next to every
          role you post — say who you are in plain words.
        </p>

        {params.error === "name" ? (
          <p className="mt-6 border-l-2 border-over pl-4">A company name is required.</p>
        ) : params.error === "website" ? (
          <p className="mt-6 border-l-2 border-over pl-4">
            The website must start with http:// or https://.
          </p>
        ) : params.error === "failed" ? (
          <p className="mt-6 border-l-2 border-over pl-4">
            Creating the company failed. Try again.
          </p>
        ) : null}

        <form action={createEmployer} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Company name
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <input id="city" name="city" className={inputClass} />
            </div>
            <div>
              <label htmlFor="website" className="text-sm font-medium">
                Website (optional)
              </label>
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              About the company
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={4000}
              className={inputClass}
              placeholder="What you do, how big the team is, what working with you is like."
            />
          </div>
          <button
            type="submit"
            className="rounded-r border border-void bg-signal px-6 py-3 font-medium text-void transition-colors duration-200 hover:bg-void hover:text-signal"
          >
            Create company
          </button>
        </form>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: sub }, { data: listings }, { data: recentApps }] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("tier, status")
        .eq("employer_id", employer.id)
        .maybeSingle(),
      supabase
        .from("listings")
        .select("id, status")
        .eq("employer_id", employer.id),
      supabase
        .from("applications")
        .select("id, status, created_at, snapshot, listings!inner(title, employer_id)")
        .eq("listings.employer_id", employer.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const tier = effectiveTier(sub);
  const limit = activeListingLimit(tier);
  const activeCount = (listings ?? []).filter((l) => l.status === "active").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-display-m">{employer.name}.</h1>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/employer/profile" className="link-grow text-void">
            Edit company profile
          </Link>
          <Link
            href={`/companies/${employer.slug}`}
            className="link-grow text-smoke"
          >
            View public page
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="border border-hairline p-6 rounded-r">
          <p className="eyebrow text-smoke">Active listings</p>
          <p className="mt-3 font-mono text-display-m font-medium tabular-nums">
            {activeCount}
            <span className="text-base text-smoke">
              {" "}
              / {Number.isFinite(limit) ? limit : "∞"}
            </span>
          </p>
          <p className="mt-2 text-sm text-smoke">
            {tier === "free" ? (
              <>
                Free tier.{" "}
                <Link href="/employer/billing" className="link-grow text-void">
                  Upgrade
                </Link>
              </>
            ) : (
              `${tier} plan`
            )}
          </p>
        </div>
        <div className="border border-hairline p-6 rounded-r">
          <p className="eyebrow text-smoke">Total listings</p>
          <p className="mt-3 font-mono text-display-m font-medium tabular-nums">
            {(listings ?? []).length}
          </p>
          <p className="mt-2 text-sm">
            <Link href="/employer/listings" className="link-grow text-void">
              Manage listings
            </Link>
          </p>
        </div>
        <div className="border border-hairline p-6 rounded-r">
          <p className="eyebrow text-smoke">New applicants</p>
          <p className="mt-3 font-mono text-display-m font-medium tabular-nums">
            {(recentApps ?? []).filter((a) => a.status === "submitted").length}
          </p>
          <p className="mt-2 text-sm">
            <Link href="/employer/applicants" className="link-grow text-void">
              Open inbox
            </Link>
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Latest applications</h2>
        {recentApps && recentApps.length > 0 ? (
          <ul className="mt-5 divide-y divide-hairline border border-hairline rounded-r">
            {recentApps.map((a) => {
              const snap = (a.snapshot ?? {}) as Record<string, unknown>;
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {String(snap.first_name ?? "")} {String(snap.last_name ?? "")}
                    </p>
                    <p className="truncate text-sm text-smoke">{a.listings?.title}</p>
                  </div>
                  <StatusChip status={a.status} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 max-w-[55ch] text-smoke">
            No applications yet. They appear here as soon as a student
            applies to one of your active listings.
            {activeCount === 0 ? (
              <>
                {" "}
                <Link href="/employer/listings/new" className="link-grow text-void">
                  Post your first listing
                </Link>{" "}
                to get started.
              </>
            ) : null}
          </p>
        )}
      </section>
    </div>
  );
}
