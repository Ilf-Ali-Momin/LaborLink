import { LimitMeter } from "@/components/ui/LimitMeter";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { addHourEntry, deleteHourEntry } from "@/app/actions/hours";
import { WERKSTUDENT_WEEKLY_HOURS } from "@/lib/compliance/config";
import { startOfWeek, toISODate, formatWeekRange, formatDayShort } from "@/lib/dates";

export const metadata = { title: "Hours" };

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  await getSessionProfile(); // layout guards; belt and braces
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("hour_entries")
    .select("id, worked_on, hours, note")
    .order("worked_on", { ascending: false })
    .limit(120);

  // Group by week, newest first.
  const weeks = new Map<
    string,
    { monday: Date; total: number; rows: NonNullable<typeof entries> }
  >();
  for (const e of entries ?? []) {
    const monday = startOfWeek(new Date(`${e.worked_on}T00:00:00`));
    const key = toISODate(monday);
    const bucket = weeks.get(key) ?? { monday, total: 0, rows: [] };
    bucket.total += Number(e.hours);
    bucket.rows.push(e);
    weeks.set(key, bucket);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-display-m">Hours.</h1>
      <p className="mt-3 max-w-[55ch] text-paper/70">
        Log what you work, per day. The weekly total is measured against the{" "}
        {WERKSTUDENT_WEEKLY_HOURS.value}-hour lecture-period limit.
      </p>

      {params.error ? (
        <p className="mt-6 border-l-2 border-over pl-4 text-sm">
          {params.error === "invalid"
            ? "Enter a date and hours between 0 and 24."
            : "Saving failed. Try again."}
        </p>
      ) : null}

      <form
        action={addHourEntry}
        className="mt-8 grid gap-4 border border-ash p-6 rounded-r sm:grid-cols-[auto_auto_1fr_auto] sm:items-end"
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
            className="mt-1.5 block border border-ash bg-transparent p-2.5 rounded-r outline-none [color-scheme:dark] focus:border-signal"
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
            className="mt-1.5 block w-24 border border-ash bg-transparent p-2.5 font-mono rounded-r outline-none focus:border-signal"
          />
        </div>
        <div>
          <label htmlFor="note" className="text-sm font-medium">
            Note (optional)
          </label>
          <input
            id="note"
            name="note"
            type="text"
            maxLength={200}
            placeholder="Which job, which shift"
            className="mt-1.5 block w-full border border-ash bg-transparent p-2.5 rounded-r outline-none focus:border-signal"
          />
        </div>
        <button
          type="submit"
          className="rounded-r bg-signal px-5 py-2.5 font-medium text-void transition-colors duration-200 hover:bg-paper"
        >
          Log hours
        </button>
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
              <ul className="mt-4 space-y-2">
                {week.rows.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-4 border-b border-ash pb-2 text-sm"
                  >
                    <span className="min-w-0 truncate font-mono tabular-nums text-paper/80">
                      {formatDayShort(e.worked_on)} · {Number(e.hours).toFixed(2)} h
                      {e.note ? <span className="text-paper/50"> — {e.note}</span> : null}
                    </span>
                    <form action={deleteHourEntry}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="link-grow text-paper/50 hover:text-paper"
                        aria-label={`Delete entry ${formatDayShort(e.worked_on)}, ${Number(e.hours).toFixed(2)} hours`}
                      >
                        Delete
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
