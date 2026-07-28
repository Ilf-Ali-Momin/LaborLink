import { LimitMeter } from "@/components/ui/LimitMeter";
import { HourStatusChip } from "@/components/hours/HourStatusChip";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { addHourEntry, deleteHourEntry } from "@/app/actions/hours";
import { WERKSTUDENT_WEEKLY_HOURS } from "@/lib/compliance/config";
import { startOfWeek, toISODate, formatWeekRange, formatDayShort } from "@/lib/dates";

export const metadata = { title: "Hours" };

const errorMessages: Record<string, string> = {
  invalid: "Enter a date and hours between 0 and 24.",
  notHired: "You can only log hours against a job you were hired for.",
  failed: "Saving failed. Try again.",
};

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const session = (await getSessionProfile())!;
  const supabase = await createClient();

  const [{ data: entries }, { data: hiredApps }] = await Promise.all([
    supabase
      .from("hour_entries")
      .select(
        "id, worked_on, hours, submitted_hours, note, status, employer_note, listing_id, listings(title, employers(name))",
      )
      .eq("student_id", session.userId)
      .order("worked_on", { ascending: false })
      .limit(120),
    // Jobs this student was actually hired for — the only ones hours may
    // be attributed to.
    supabase
      .from("applications")
      .select("listing_id, listings(title, employers(name))")
      .eq("student_id", session.userId)
      .eq("status", "hired"),
  ]);

  const jobs = (hiredApps ?? []).map((a) => ({
    id: a.listing_id,
    label: `${a.listings?.title ?? "Job"} — ${a.listings?.employers?.name ?? ""}`,
  }));

  const weeks = new Map<
    string,
    { monday: Date; total: number; unconfirmed: number; rows: NonNullable<typeof entries> }
  >();
  for (const e of entries ?? []) {
    const monday = startOfWeek(new Date(`${e.worked_on}T00:00:00`));
    const key = toISODate(monday);
    const bucket = weeks.get(key) ?? { monday, total: 0, unconfirmed: 0, rows: [] };
    bucket.total += Number(e.hours);
    if (e.status === "self_reported") bucket.unconfirmed += Number(e.hours);
    bucket.rows.push(e);
    weeks.set(key, bucket);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-display-m">Hours.</h1>
      <p className="mt-3 max-w-[60ch] text-paper/70">
        Log every job you work, including employers who are not on
        LaborLink. The {WERKSTUDENT_WEEKLY_HOURS.value}-hour weekly limit
        counts all of them together, so a missing job makes this number
        wrong. Your employer confirms the hours for their own job.
      </p>

      {params.error ? (
        <p className="mt-6 border-l-2 border-over pl-4 text-sm">
          {errorMessages[params.error] ?? errorMessages.failed}
        </p>
      ) : null}

      <form
        action={addHourEntry}
        className="mt-8 grid gap-4 border border-ash p-6 rounded-r sm:grid-cols-2"
      >
        <div>
          <label htmlFor="worked_on" className="text-sm font-medium">
            Day
          </label>
          <input
            id="worked_on"
            name="worked_on"
            type="date"
            required
            defaultValue={toISODate(new Date())}
            max={toISODate(new Date())}
            className="mt-1.5 block w-full border border-ash bg-transparent p-2.5 rounded-r outline-none [color-scheme:dark] focus:border-signal"
          />
        </div>
        <div>
          <label htmlFor="hours" className="text-sm font-medium">
            Hours
          </label>
          <input
            id="hours"
            name="hours"
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            required
            placeholder="4"
            className="mt-1.5 block w-full border border-ash bg-transparent p-2.5 font-mono rounded-r outline-none focus:border-signal"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="listing_id" className="text-sm font-medium">
            Which job
          </label>
          <select
            id="listing_id"
            name="listing_id"
            defaultValue={jobs.length === 1 ? jobs[0].id : "other"}
            className="mt-1.5 block w-full border border-ash bg-void p-2.5 rounded-r outline-none focus:border-signal"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.label}
              </option>
            ))}
            <option value="other">Another employer (not on LaborLink)</option>
          </select>
          <p className="mt-1.5 text-sm text-paper/50">
            {jobs.length === 0
              ? "Once an employer hires you here, their job appears in this list and they can confirm your hours."
              : "Hours for a job listed here go to that employer to confirm."}
          </p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="note" className="text-sm font-medium">
            Note (optional)
          </label>
          <input
            id="note"
            name="note"
            type="text"
            maxLength={200}
            placeholder="Which shift"
            className="mt-1.5 block w-full border border-ash bg-transparent p-2.5 rounded-r outline-none focus:border-signal"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-r bg-signal px-5 py-2.5 font-medium text-void transition-colors duration-200 hover:bg-paper"
          >
            Log hours
          </button>
        </div>
      </form>

      {weeks.size === 0 ? (
        <p className="mt-10 text-paper/60">
          Nothing logged yet. Your first week appears here as soon as you log
          a day.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {[...weeks.values()].map((week) => (
            <section key={toISODate(week.monday)}>
              <LimitMeter
                value={Math.round(week.total * 4) / 4}
                limit={WERKSTUDENT_WEEKLY_HOURS.value}
                unit="h"
                label={`Week of ${formatWeekRange(week.monday)}`}
                scale="strip"
                ground="void"
              />
              {week.unconfirmed > 0 ? (
                <p className="mt-2 text-sm text-paper/50">
                  {week.unconfirmed.toFixed(2)} h of this is not confirmed by
                  an employer yet.
                </p>
              ) : null}
              <ul className="mt-4 space-y-2">
                {week.rows.map((e) => {
                  const locked = e.status !== "self_reported";
                  return (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ash pb-2 text-sm"
                    >
                      <span className="min-w-0 font-mono tabular-nums text-paper/80">
                        {formatDayShort(e.worked_on)} · {Number(e.hours).toFixed(2)} h
                        {e.status === "corrected" ? (
                          <span className="text-near">
                            {" "}
                            (you logged {Number(e.submitted_hours).toFixed(2)})
                          </span>
                        ) : null}
                        <span className="text-paper/50">
                          {" "}
                          — {e.listings?.employers?.name ?? "Other employer"}
                          {e.note ? ` · ${e.note}` : ""}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <HourStatusChip status={e.status} />
                        {locked ? (
                          <span className="text-paper/30" title="Confirmed hours cannot be changed">
                            Locked
                          </span>
                        ) : (
                          <form action={deleteHourEntry}>
                            <input type="hidden" name="id" value={e.id} />
                            <button
                              type="submit"
                              className="link-grow text-paper/50 hover:text-paper"
                              aria-label={`Delete entry ${formatDayShort(e.worked_on)}`}
                            >
                              Delete
                            </button>
                          </form>
                        )}
                      </span>
                      {e.employer_note ? (
                        <p className="w-full text-paper/50">
                          Employer note: {e.employer_note}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
