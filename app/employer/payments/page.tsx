import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyEmployer } from "@/lib/employer";
import { recordPayment, unrecordPayment } from "@/app/actions/payments";
import { buildPayPeriods, formatGross, isOverdue } from "@/lib/payments";
import { formatEurCents } from "@/lib/compliance/logic";
import { toISODate } from "@/lib/dates";

export const metadata = { title: "Payments" };

const errorMessages: Record<string, string> = {
  invalid: "Check the payment date and amounts.",
  nohours: "No confirmed hours for that month, so there is nothing to pay yet.",
  failed: "Saving failed. Try again.",
};

export default async function EmployerPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; removed?: string; error?: string }>;
}) {
  const params = await searchParams;
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const supabase = await createClient();
  const [{ data: hours }, { data: listings }, { data: payments }, { data: apps }] =
    await Promise.all([
      // RLS returns only hours for students this employer hired.
      supabase
        .from("hour_entries")
        .select("worked_on, hours, status, listing_id, student_id")
        .not("listing_id", "is", null),
      supabase
        .from("listings")
        .select("id, title, hourly_wage_cents")
        .eq("employer_id", employer.id),
      supabase
        .from("payments")
        .select("id, student_id, listing_id, period_start, paid_on, reference, gross_cents")
        .eq("employer_id", employer.id),
      supabase
        .from("applications")
        .select("student_id, snapshot")
        .eq("status", "hired"),
    ]);

  const listingMap = new Map(
    (listings ?? []).map((l) => [
      l.id,
      { title: l.title, hourlyWageCents: l.hourly_wage_cents },
    ]),
  );

  const names = new Map<string, string>();
  for (const a of apps ?? []) {
    const s = (a.snapshot ?? {}) as Record<string, unknown>;
    const n = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
    if (n) names.set(a.student_id, n);
  }

  const periods = buildPayPeriods(hours ?? [], listingMap, payments ?? []);
  const paymentIdFor = new Map(
    (payments ?? []).map((p) => [
      `${p.student_id}:${p.listing_id}:${p.period_start}`,
      p.id,
    ]),
  );
  const outstanding = periods.filter((p) => !p.paid);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-display-m">Payments.</h1>
      <p className="mt-3 max-w-[65ch] text-smoke">
        Gross pay per student per month, calculated from the hours you
        confirmed. LaborLink does not move money — you pay as you normally
        do, then record it here so the student can see the hours they worked
        were paid.
      </p>
      <div className="mt-5 max-w-[65ch] border-l-2 border-near pl-4 text-sm text-smoke">
        These figures are <strong className="text-void">gross</strong>. Wage
        tax and social security contributions are your payroll
        responsibility and are not calculated here.
      </div>

      {params.saved ? (
        <p className="mt-6 border-l-2 border-signal-dk pl-4">Payment recorded.</p>
      ) : null}
      {params.removed ? (
        <p className="mt-6 border-l-2 border-signal-dk pl-4">Payment record removed.</p>
      ) : null}
      {params.error ? (
        <p className="mt-6 border-l-2 border-over pl-4">
          {errorMessages[params.error] ?? errorMessages.failed}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">
          Outstanding ({outstanding.length})
        </h2>
        {outstanding.length === 0 ? (
          <p className="mt-4 max-w-[55ch] text-smoke">
            Nothing outstanding. A month appears here once you have confirmed
            hours for a student you hired.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {outstanding.map((p) => (
              <li key={p.key} className="border border-hairline p-5 rounded-r">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-medium">
                    {names.get(p.studentId) ?? "Student"}
                    <span className="text-smoke"> · {p.listingTitle}</span>
                  </p>
                  <p className="text-sm text-smoke">
                    {p.label}
                    {isOverdue(p) ? (
                      <span className="text-over"> · month ended</span>
                    ) : null}
                  </p>
                </div>
                <p className="mt-2 font-mono text-lg tabular-nums">
                  {formatGross(p.grossCents)}
                  <span className="text-sm text-smoke">
                    {" "}
                    = {p.hours.toFixed(2)} h × {formatEurCents(p.hourlyWageCents)} gross
                  </span>
                </p>

                <form
                  action={recordPayment}
                  className="mt-4 flex flex-wrap items-end gap-3 border-t border-hairline pt-4"
                >
                  <input type="hidden" name="student_id" value={p.studentId} />
                  <input type="hidden" name="listing_id" value={p.listingId} />
                  <input type="hidden" name="period_start" value={p.periodStart} />
                  <div>
                    <label htmlFor={`d-${p.key}`} className="text-xs text-smoke">
                      Paid on
                    </label>
                    <input
                      id={`d-${p.key}`}
                      name="paid_on"
                      type="date"
                      required
                      defaultValue={toISODate(new Date())}
                      className="mt-1 block border border-hairline bg-paper p-2 text-sm rounded-r outline-none focus:border-void"
                    />
                  </div>
                  <div className="min-w-[12rem] flex-1">
                    <label htmlFor={`r-${p.key}`} className="text-xs text-smoke">
                      Reference (optional)
                    </label>
                    <input
                      id={`r-${p.key}`}
                      name="reference"
                      maxLength={140}
                      placeholder="Transfer reference"
                      className="mt-1 block w-full border border-hairline bg-paper p-2 text-sm rounded-r outline-none focus:border-void"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-r border border-void bg-signal px-5 py-2.5 text-sm font-medium text-void transition-colors hover:bg-void hover:text-signal"
                  >
                    Mark paid
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {periods.some((p) => p.paid) ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Paid</h2>
          <ul className="mt-5 divide-y divide-hairline border border-hairline rounded-r">
            {periods
              .filter((p) => p.paid)
              .map((p) => (
                <li
                  key={p.key}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">
                      {names.get(p.studentId) ?? "Student"}
                    </span>
                    <span className="text-smoke">
                      {" "}
                      · {p.label} · paid{" "}
                      {new Date(`${p.paid!.paidOn}T00:00:00`).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                    {p.paid!.reference ? (
                      <span className="block text-smoke">
                        Ref: {p.paid!.reference}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="font-mono tabular-nums">
                      {formatGross(p.paid!.grossCents)}
                    </span>
                    <form action={unrecordPayment}>
                      <input
                        type="hidden"
                        name="id"
                        value={
                          paymentIdFor.get(
                            `${p.studentId}:${p.listingId}:${p.periodStart}`,
                          ) ?? ""
                        }
                      />
                      <button
                        type="submit"
                        className="link-grow text-smoke hover:text-void"
                      >
                        Undo
                      </button>
                    </form>
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
