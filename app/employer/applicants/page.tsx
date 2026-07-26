import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyEmployer } from "@/lib/employer";
import { updateApplicationStatus } from "@/app/actions/listings";
import { StatusChip } from "@/components/ui/StatusChip";

export const metadata = { title: "Applicants" };

export default async function ApplicantsPage() {
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const supabase = await createClient();
  // RLS exposes only applications on this employer's listings; the inner
  // filter is defense in depth.
  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, message, created_at, snapshot, listings!inner(title, slug, employer_id)")
    .eq("listings.employer_id", employer.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-display-m">Applicants.</h1>
      <p className="mt-3 max-w-[60ch] text-smoke">
        You see the fields each student chose to share for their
        application. Work authorization is a computed yes/no — the
        underlying documents never reach you, by design.
      </p>

      {!applications || applications.length === 0 ? (
        <div className="mt-8 max-w-[55ch] border border-hairline p-8 rounded-r">
          <p className="text-body-l">No applications yet.</p>
          <p className="mt-2 text-smoke">
            Applications land here the moment a student applies to one of
            your live listings.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {applications.map((a) => {
            const snap = (a.snapshot ?? {}) as Record<string, unknown>;
            const languages = Array.isArray(snap.languages)
              ? (snap.languages as string[]).join(", ")
              : null;
            return (
              <li key={a.id} className="border border-hairline p-6 rounded-r">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {String(snap.first_name ?? "")} {String(snap.last_name ?? "")}
                    </p>
                    <p className="mt-1 text-sm text-smoke">
                      Applied to <span className="text-void">{a.listings?.title}</span>{" "}
                      ·{" "}
                      {new Date(a.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <StatusChip status={a.status} />
                </div>

                <dl className="mt-5 grid gap-x-8 gap-y-3 border-t border-hairline pt-5 text-sm sm:grid-cols-2">
                  {snap.university ? (
                    <div>
                      <dt className="text-smoke">University</dt>
                      <dd>{String(snap.university)}</dd>
                    </div>
                  ) : null}
                  {snap.degree_program ? (
                    <div>
                      <dt className="text-smoke">Degree program</dt>
                      <dd>
                        {String(snap.degree_program)}
                        {snap.semester ? `, semester ${snap.semester}` : ""}
                      </dd>
                    </div>
                  ) : null}
                  {snap.city ? (
                    <div>
                      <dt className="text-smoke">City</dt>
                      <dd>{String(snap.city)}</dd>
                    </div>
                  ) : null}
                  {languages ? (
                    <div>
                      <dt className="text-smoke">Languages</dt>
                      <dd>{languages}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-smoke">Authorized to work (self-declared)</dt>
                    <dd className="font-medium">
                      {snap.work_authorized ? "Yes" : "Not confirmed"}
                    </dd>
                  </div>
                </dl>

                {a.message ? (
                  <blockquote className="mt-5 border-l-2 border-hairline pl-4 text-smoke">
                    {a.message}
                  </blockquote>
                ) : null}

                {a.status !== "withdrawn" ? (
                  <form
                    action={updateApplicationStatus}
                    className="mt-5 flex flex-wrap items-center gap-3 border-t border-hairline pt-5"
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <label htmlFor={`status-${a.id}`} className="text-sm text-smoke">
                      Move to
                    </label>
                    <select
                      id={`status-${a.id}`}
                      name="status"
                      defaultValue={a.status === "submitted" ? "in_review" : a.status}
                      className="border border-hairline bg-paper px-3 py-2 text-sm rounded-r outline-none focus:border-void"
                    >
                      <option value="in_review">In review</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Not selected</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-r border border-void px-4 py-2 text-sm font-medium transition-colors hover:bg-void hover:text-paper"
                    >
                      Update
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
