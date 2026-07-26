import Link from "next/link";
import { LimitMeter } from "@/components/ui/LimitMeter";
import { StatusChip } from "@/components/ui/StatusChip";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { WERKSTUDENT_WEEKLY_HOURS } from "@/lib/compliance/config";
import { startOfWeek, addDays, toISODate, formatWeekRange, formatDayShort } from "@/lib/dates";

export default async function DashboardOverview() {
  const session = (await getSessionProfile())!;
  const supabase = await createClient();

  const monday = startOfWeek(new Date());
  const weekStart = toISODate(monday);
  const weekEnd = toISODate(addDays(monday, 6));

  const [{ data: profile }, { data: weekEntries }, { data: applications }] =
    await Promise.all([
      supabase
        .from("student_profiles")
        .select("first_name")
        .eq("user_id", session.userId)
        .maybeSingle(),
      supabase
        .from("hour_entries")
        .select("worked_on, hours, note")
        .gte("worked_on", weekStart)
        .lte("worked_on", weekEnd)
        .order("worked_on"),
      supabase
        .from("applications")
        .select("id, status, created_at, listings(title, slug)")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const weekTotal = (weekEntries ?? []).reduce((sum, e) => sum + Number(e.hours), 0);

  return (
    <div>
      <h1 className="font-display text-display-m">
        {profile?.first_name ? `${profile.first_name}.` : "Your dashboard."}
      </h1>

      {/* The limit meter is the hero of this page. */}
      <section className="mt-8 border border-ash bg-ash/50 p-6 rounded-r sm:p-8">
        <LimitMeter
          value={weekTotal}
          limit={WERKSTUDENT_WEEKLY_HOURS.value}
          unit="h"
          label="This week"
          sublabel={formatWeekRange(monday)}
          scale="hero"
          ground="void"
        />
        {weekEntries && weekEntries.length > 0 ? (
          <ul className="mt-8 space-y-3 border-t border-ash pt-6 font-mono text-sm tabular-nums text-paper/70">
            {weekEntries.map((e, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>
                  {formatDayShort(e.worked_on)}
                  {e.note ? ` — ${e.note}` : ""}
                </span>
                <span>{Number(e.hours).toFixed(1)} h</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 border-t border-ash pt-6 text-paper/60">
            No hours logged this week.{" "}
            <Link href="/dashboard/hours" className="link-grow text-paper">
              Log your first entry
            </Link>{" "}
            to see the meter move.
          </p>
        )}
        <p className="mt-6 text-sm text-paper/50">
          The {WERKSTUDENT_WEEKLY_HOURS.value}-hour line applies during the
          lecture period, across all your jobs together.{" "}
          <Link href="/compliance#werkstudent" className="link-grow text-paper/80">
            The full rule
          </Link>
        </p>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="border border-ash p-6 rounded-r">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold">Applications</h2>
            <Link href="/dashboard/applications" className="link-grow text-sm text-paper/60">
              All applications
            </Link>
          </div>
          {applications && applications.length > 0 ? (
            <ul className="mt-5 space-y-4">
              {applications.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 border-t border-ash pt-4 first:border-t-0 first:pt-0">
                  <Link href={`/jobs/${a.listings?.slug}`} className="link-grow min-w-0 truncate text-paper">
                    {a.listings?.title}
                  </Link>
                  <StatusChip status={a.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-paper/60">
              No applications yet.{" "}
              <Link href="/jobs" className="link-grow text-paper">
                Browse jobs
              </Link>{" "}
              to get started.
            </p>
          )}
        </section>

        <section className="border border-ash p-6 rounded-r">
          <h2 className="font-display text-xl font-semibold">Keep it accurate</h2>
          <ul className="mt-5 space-y-4 text-paper/70">
            <li className="border-t border-ash pt-4 first:border-t-0 first:pt-0">
              <Link href="/dashboard/profile" className="link-grow text-paper">
                Complete your profile
              </Link>{" "}
              — it becomes the snapshot employers see when you apply.
            </li>
            <li className="border-t border-ash pt-4">
              <Link href="/dashboard/hours" className="link-grow text-paper">
                Log hours weekly
              </Link>{" "}
              — the meter is only as honest as what you feed it.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
