import Link from "next/link";
import { StatusChip } from "@/components/ui/StatusChip";
import { createClient } from "@/lib/supabase/server";
import { withdrawApplication } from "@/app/actions/applications";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, created_at, message, listings(title, slug, employers(name))")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-display-m">Applications.</h1>

      {!applications || applications.length === 0 ? (
        <div className="mt-8 border border-ash p-8 rounded-r">
          <p className="text-body-l">No applications yet.</p>
          <p className="mt-2 text-paper/60">
            Every listing states its hours and pay against the legal limits,
            so you know before you apply.
          </p>
          <p className="mt-5">
            <Link href="/jobs" className="link-grow text-paper">
              Browse jobs
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {applications.map((a) => {
            const canWithdraw =
              a.status === "submitted" || a.status === "in_review";
            return (
              <li key={a.id} className="border border-ash p-5 rounded-r">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${a.listings?.slug}`}
                      className="link-grow font-display text-lg font-semibold text-paper"
                    >
                      {a.listings?.title}
                    </Link>
                    <p className="mt-1 text-sm text-paper/60">
                      {a.listings?.employers?.name} · sent{" "}
                      {new Date(a.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusChip status={a.status} />
                    {canWithdraw ? (
                      <form action={withdrawApplication}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="link-grow text-sm text-paper/50 hover:text-paper"
                        >
                          Withdraw
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
