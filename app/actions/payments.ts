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
  const hours = Number(formData.get("confirmed_hours"));
  const wageCents = Number(formData.get("hourly_wage_cents"));
  const grossCents = Number(formData.get("gross_cents"));
  const reference = String(formData.get("reference") ?? "").trim().slice(0, 140);

  const validDates =
    /^\d{4}-\d{2}-\d{2}$/.test(periodStart) && /^\d{4}-\d{2}-\d{2}$/.test(paidOn);
  const validAmounts =
    Number.isFinite(hours) &&
    hours >= 0 &&
    Number.isInteger(wageCents) &&
    Number.isInteger(grossCents) &&
    grossCents >= 0;

  if (!studentId || !listingId || !validDates || !validAmounts) {
    redirect("/employer/payments?error=invalid");
  }

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
