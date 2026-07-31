import { formatEurCents } from "@/lib/compliance/logic";

/**
 * A month of confirmed work for one student on one listing.
 *
 * Only employer-confirmed hours count. Self-reported hours are a claim, not
 * a payable figure — that distinction is the whole reason the confirmation
 * step exists.
 *
 * The amount is GROSS. Wage tax and social security contributions are the
 * employer's payroll duty and are deliberately not modelled here.
 */
export interface PayPeriod {
  key: string;
  periodStart: string; // YYYY-MM-01
  label: string;
  listingId: string;
  listingTitle: string;
  studentId: string;
  hours: number;
  hourlyWageCents: number;
  grossCents: number;
  paid: null | {
    paidOn: string;
    reference: string | null;
    grossCents: number;
  };
}

export interface ConfirmedHourRow {
  worked_on: string;
  hours: number | string;
  status: string;
  listing_id: string | null;
  student_id: string;
}

export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function monthLabel(periodStart: string): string {
  return new Date(`${periodStart}T00:00:00`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Groups confirmed hours into monthly pay periods and attaches any recorded
 * payment. A period with no payment row is simply unpaid.
 */
export function buildPayPeriods(
  hours: ConfirmedHourRow[],
  listings: Map<string, { title: string; hourlyWageCents: number }>,
  payments: {
    student_id: string;
    listing_id: string;
    period_start: string;
    paid_on: string;
    reference: string | null;
    gross_cents: number;
  }[],
): PayPeriod[] {
  const buckets = new Map<string, PayPeriod>();

  for (const h of hours) {
    // Only confirmed work is payable, and only against a listing on the
    // platform — outside employers are not ours to track.
    if (h.status !== "confirmed" && h.status !== "corrected") continue;
    if (!h.listing_id) continue;
    const listing = listings.get(h.listing_id);
    if (!listing) continue;

    const periodStart = monthStart(h.worked_on);
    const key = `${h.student_id}:${h.listing_id}:${periodStart}`;
    const bucket = buckets.get(key) ?? {
      key,
      periodStart,
      label: monthLabel(periodStart),
      listingId: h.listing_id,
      listingTitle: listing.title,
      studentId: h.student_id,
      hours: 0,
      hourlyWageCents: listing.hourlyWageCents,
      grossCents: 0,
      paid: null,
    };
    bucket.hours += Number(h.hours);
    buckets.set(key, bucket);
  }

  for (const b of buckets.values()) {
    b.hours = Math.round(b.hours * 100) / 100;
    b.grossCents = Math.round(b.hours * b.hourlyWageCents);
  }

  for (const p of payments) {
    const key = `${p.student_id}:${p.listing_id}:${p.period_start}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.paid = {
        paidOn: p.paid_on,
        reference: p.reference,
        grossCents: p.gross_cents,
      };
    }
  }

  return [...buckets.values()].sort((a, b) =>
    b.periodStart.localeCompare(a.periodStart),
  );
}

export function formatGross(cents: number): string {
  return formatEurCents(cents);
}

/** A period is overdue once the month has ended and nothing was recorded. */
export function isOverdue(period: PayPeriod, today = new Date()): boolean {
  if (period.paid) return false;
  const end = new Date(`${period.periodStart}T00:00:00`);
  end.setMonth(end.getMonth() + 1);
  return today >= end;
}
