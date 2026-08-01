"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireEmployer, getMyEmployer } from "@/lib/employer";

/**
 * Records that the employer paid a student for a month. No money moves
 * through LaborLink — this is a record of a transfer made elsewhere, so a
 * student can see whether confirmed hours were actually paid.
 */
export async function recordPayment(formData: FormData) {
  const { supabase } = await requireEmployer();
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const studentId = String(formData.get("student_id") ?? "");
  const listingId = String(formData.get("listing_id") ?? "");
  const periodStart = String(formData.get("period_start") ?? "");
  const paidOn = String(formData.get("paid_on") ?? "");
  const reference = String(formData.get("reference") ?? "").trim().slice(0, 140);

  const validDates =
    /^\d{4}-\d{2}-\d{2}$/.test(periodStart) && /^\d{4}-\d{2}-\d{2}$/.test(paidOn);
  if (!studentId || !listingId || !validDates) {
    redirect("/employer/payments?error=invalid");
  }

  // Amounts are DERIVED here, never taken from the form. The browser sends
  // hidden fields for display convenience, but trusting them would let an
  // employer record any figure they liked against a student's name — and
  // the student sees this record as evidence they were paid correctly.
  const periodEnd = new Date(`${periodStart}T00:00:00`);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const periodEndIso = periodEnd.toISOString().slice(0, 10);

  const [{ data: confirmed }, { data: listing }] = await Promise.all([
    // RLS already restricts this to students this employer actually hired.
    supabase
      .from("hour_entries")
      .select("hours, status")
      .eq("student_id", studentId)
      .eq("listing_id", listingId)
      .gte("worked_on", periodStart)
      .lt("worked_on", periodEndIso),
    supabase
      .from("listings")
      .select("hourly_wage_cents")
      .eq("id", listingId)
      .eq("employer_id", employer.id)
      .maybeSingle(),
  ]);

  if (!listing) redirect("/employer/payments?error=invalid");

  // Only employer-confirmed work is payable; a self-reported claim is not.
  const hours =
    Math.round(
      (confirmed ?? [])
        .filter((h) => h.status === "confirmed" || h.status === "corrected")
        .reduce((sum, h) => sum + Number(h.hours), 0) * 100,
    ) / 100;

  if (hours <= 0) redirect("/employer/payments?error=nohours");

  const wageCents = listing.hourly_wage_cents;
  const grossCents = Math.round(hours * wageCents);

  // RLS confirms this employer actually employs the student for this
  // listing; the amounts are snapshotted so a later rate change cannot
  // rewrite history.
  const { error } = await supabase.from("payments").upsert(
    {
      employer_id: employer.id,
      student_id: studentId,
      listing_id: listingId,
      period_start: periodStart,
      confirmed_hours: hours,
      hourly_wage_cents: wageCents,
      gross_cents: grossCents,
      paid_on: paidOn,
      reference: reference || null,
    },
    { onConflict: "student_id,listing_id,period_start" },
  );

  if (error) {
    console.error("recordPayment failed", { code: error.code });
    redirect("/employer/payments?error=failed");
  }

  revalidatePath("/employer/payments");
  revalidatePath("/dashboard/payments");
  redirect("/employer/payments?saved=1");
}

/** Undoes a payment record, e.g. entered against the wrong month. */
export async function unrecordPayment(formData: FormData) {
  const { supabase } = await requireEmployer();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/employer/payments");

  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) {
    console.error("unrecordPayment failed", { code: error.code });
    redirect("/employer/payments?error=failed");
  }

  revalidatePath("/employer/payments");
  revalidatePath("/dashboard/payments");
  redirect("/employer/payments?removed=1");
}
