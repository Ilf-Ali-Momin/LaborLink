import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyEmployer } from "@/lib/employer";
import { reviewHourEntry } from "@/app/actions/hours";
import { HourStatusChip } from "@/components/hours/HourStatusChip";
import { formatDayShort } from "@/lib/dates";

export const metadata = { title: "Hours" };

const errorMessages: Record<string, string> = {
  invalid: "Enter hours between 0 and 24.",
  notfound: "That entry no longer exists.",
  failed: "Saving failed. Try again.",
};

export default async function EmployerHoursPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewed?: string; error?: string }>;
}) {
  const params = await searchParams;
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const supabase = await createClient();
  // RLS returns only entries for students this employer actually hired.
  const { data: entries } = await supabase
    .from("hour_entries")
    .select(
      "id, worked_on, hours, submitted_hours, note, status, employer_note, student_id, listings!inner(title)",
    )
    .order("worked_on", { ascending: false })
    .limit(200);

  const rows = entries ?? [];
  const pending = rows.filter((e) => e.status === "self_reported");
  const reviewed = rows.filter((e) => e.status !== "self_reported");

  // Applicant snapshots carry the consented name; the live student profile
  // is never readable by an employer.
  const studentIds = [...new Set(rows.map((e) => e.student_id))];
  const names = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: apps } = await supabase
      .from("applications")
      .select("student_id, snapshot")
      .in("student_id", studentIds)
      .eq("status", "hired");
    for (const a of apps ?? []) {
      const s = (a.snapshot ?? {}) as Record<string, unknown>;
      const name = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
      if (name) names.set(a.student_id, name);
    }
  }
  const nameOf = (id: string) => names.get(id) ?? "Student";

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-display-m">Hours.</h1>
      <p className="mt-3 max-w-[65ch] text-smoke">
        Students log their own hours because the 20-hour weekly limit counts
        every job they hold, not just yours. You confirm or correct the
        hours worked for your roles — that is what makes them a record
        rather than a claim. Their original figure is always kept.
      </p>

      {params.reviewed ? (
        <p className="mt-6 border-l-2 border-signal-dk pl-4">Hours updated.</p>
      ) : null}
      {params.error ? (
        <p className="mt-6 border-l-2 border-over pl-4">
          {errorMessages[params.error] ?? errorMessages.failed}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">
          Waiting for you ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-4 max-w-[55ch] text-smoke">
            Nothing to review. Hours appear here when a student you hired
            logs time against one of your roles.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {pending.map((e) => (
              <li key={e.id} className="border border-hairline p-5 rounded-r">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-medium">
                    {nameOf(e.student_id)}
                    <span className="text-smoke"> · {e.listings?.title}</span>
                  </p>
                  <p className="font-mono text-sm tabular-nums text-smoke">
                    {formatDayShort(e.worked_on)}
                  </p>
                </div>
                <p className="mt-1 font-mono text-lg tabular-nums">
                  {Number(e.submitted_hours).toFixed(2)} h
                  {e.note ? (
                    <span className="font-body text-sm text-smoke"> — {e.note}</span>
                  ) : null}
                </p>

                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-hairline pt-4">
                  <form action={reviewHourEntry}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="action" value="confirm" />
                    <button
                      type="submit"
                      className="rounded-r border border-void bg-signal px-5 py-2.5 text-sm font-medium text-void transition-colors hover:bg-void hover:text-signal"
                    >
                      Confirm {Number(e.submitted_hours).toFixed(2)} h
                    </button>
                  </form>

                  <form action={reviewHourEntry} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="action" value="correct" />
                    <div>
                      <label
                        htmlFor={`h-${e.id}`}
                        className="text-xs text-smoke"
                      >
                        Correct to
                      </label>
                      <input
                        id={`h-${e.id}`}
                        name="hours"
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="24"
                        defaultValue={Number(e.submitted_hours).toFixed(2)}
                        className="mt-1 block w-24 border border-hairline bg-paper p-2 font-mono text-sm rounded-r outline-none focus:border-void"
                      />
                    </div>
                    <div className="min-w-[12rem] flex-1">
                      <label
                        htmlFor={`n-${e.id}`}
                        className="text-xs text-smoke"
                      >
                        Reason (optional)
                      </label>
                      <input
                        id={`n-${e.id}`}
                        name="employer_note"
                        maxLength={300}
                        placeholder="Shift ended an hour early"
                        className="mt-1 block w-full border border-hairline bg-paper p-2 text-sm rounded-r outline-none focus:border-void"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-r border border-void px-4 py-2 text-sm font-medium transition-colors hover:bg-void hover:text-paper"
                    >
                      Correct
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {reviewed.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Reviewed</h2>
          <ul className="mt-5 divide-y divide-hairline border border-hairline rounded-r">
            {reviewed.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
              >
                <span className="min-w-0">
                  <span className="font-medium">{nameOf(e.student_id)}</span>
                  <span className="text-smoke"> · {formatDayShort(e.worked_on)}</span>
                  {e.employer_note ? (
                    <span className="block text-smoke">{e.employer_note}</span>
                  ) : null}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono tabular-nums">
                    {Number(e.hours).toFixed(2)} h
                    {e.status === "corrected" ? (
                      <span className="text-smoke">
                        {" "}
                        (logged {Number(e.submitted_hours).toFixed(2)})
                      </span>
                    ) : null}
                  </span>
                  <HourStatusChip status={e.status} ground="paper" />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
