import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { buildPayPeriods, formatGross, isOverdue } from "@/lib/payments";
import { formatEurCents } from "@/lib/compliance/logic";

export const metadata = { title: "Payments" };

export default async function StudentPaymentsPage() {
  const session = (await getSessionProfile())!;
  const supabase = await createClient();

  const [{ data: hours }, { data: payments }] = await Promise.all([
    supabase
      .from("hour_entries")
      .select("worked_on, hours, status, listing_id, student_id, listings(id, title, hourly_wage_cents)")
      .eq("student_id", session.userId)
      .not("listing_id", "is", null),
    supabase
      .from("payments")
      .select("student_id, listing_id, period_start, paid_on, reference, gross_cents")
      .eq("student_id", session.userId),
  ]);

  const listingMap = new Map<string, { title: string; hourlyWageCents: number }>();
  for (const h of hours ?? []) {
    if (h.listings) {
      listingMap.set(h.listings.id, {
        title: h.listings.title,
        hourlyWageCents: h.listings.hourly_wage_cents,
      });
    }
  }

  const periods = buildPayPeriods(hours ?? [], listingMap, payments ?? []);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-display-m">Payments.</h1>
      <p className="mt-3 max-w-[60ch] text-paper/70">
        What you earned for the hours your employer confirmed, and whether
        they have recorded paying it. Hours that are still waiting for
        confirmation are not counted here yet.
      </p>
      <p className="mt-4 max-w-[60ch] border-l-2 border-ash pl-4 text-sm text-paper/60">
        These amounts are gross, before tax and social security. Your payslip
        from the employer is the official document. LaborLink does not handle
        the money — it records what the employer says they paid.
      </p>

      {periods.length === 0 ? (
        <div className="mt-8 border border-ash p-8 rounded-r">
          <p className="text-body-l">Nothing to show yet.</p>
          <p className="mt-2 text-paper/60">
            A month appears here once an employer confirms hours you logged
            against their job.{" "}
            <Link href="/dashboard/hours" className="link-grow text-paper">
              Log your hours
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {periods.map((p) => {
            const overdue = isOverdue(p);
            return (
              <li key={p.key} className="border border-ash p-5 rounded-r">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-display text-lg font-semibold">{p.label}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                      p.paid
                        ? "border-under/40 text-paper"
                        : overdue
                          ? "border-over/50 text-over"
                          : "border-ash text-paper/60"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`size-1.5 rounded-full ${
                        p.paid ? "bg-under" : overdue ? "bg-over" : "bg-smoke"
                      }`}
                    />
                    {p.paid ? "Paid" : overdue ? "Not paid yet" : "Current month"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-paper/60">{p.listingTitle}</p>
                <p className="mt-3 font-mono text-lg tabular-nums">
                  {formatGross(p.grossCents)}
                  <span className="text-sm text-paper/50">
                    {" "}
                    = {p.hours.toFixed(2)} h × {formatEurCents(p.hourlyWageCents)}
                  </span>
                </p>
                {p.paid ? (
                  <p className="mt-2 text-sm text-paper/60">
                    Employer recorded payment on{" "}
                    {new Date(`${p.paid.paidOn}T00:00:00`).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {p.paid.reference ? ` · ${p.paid.reference}` : ""}
                  </p>
                ) : overdue ? (
                  <p className="mt-2 text-sm text-paper/60">
                    The month has ended and no payment is recorded. If you
                    have been paid, ask your employer to record it. If you
                    have not, this is your evidence of the hours worked.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
