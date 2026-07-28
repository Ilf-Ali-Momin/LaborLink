"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEmployer } from "@/lib/employer";

/** Auth re-checked first — server actions are public endpoints. */
async function requireStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "student") redirect("/");
  return { supabase, userId: user.id };
}

export async function addHourEntry(formData: FormData) {
  const { supabase, userId } = await requireStudent();

  const workedOn = String(formData.get("worked_on") ?? "");
  const hours = Number(formData.get("hours"));
  const note = String(formData.get("note") ?? "").trim();
  const listingRaw = String(formData.get("listing_id") ?? "");
  // Empty means an employer not on LaborLink. Those hours still count
  // toward the legal limit, so they must be recordable.
  const listingId = listingRaw && listingRaw !== "other" ? listingRaw : null;

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(workedOn);
  const validHours = Number.isFinite(hours) && hours > 0 && hours <= 24;
  if (!validDate || !validHours) {
    redirect("/dashboard/hours?error=invalid");
  }

  const { error } = await supabase.from("hour_entries").insert({
    student_id: userId,
    worked_on: workedOn,
    hours,
    note: note || null,
    listing_id: listingId,
  });

  if (error) {
    console.error("addHourEntry failed", { code: error.code });
    // The database trigger rejects hours logged against a job the student
    // was not hired for.
    redirect(`/dashboard/hours?error=${error.code === "P0001" ? "notHired" : "failed"}`);
  }

  revalidatePath("/dashboard/hours");
  revalidatePath("/dashboard");
  redirect("/dashboard/hours");
}

export async function deleteHourEntry(formData: FormData) {
  const { supabase, userId } = await requireStudent();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/hours");

  // RLS allows deletion only while the entry is still self_reported.
  await supabase
    .from("hour_entries")
    .delete()
    .eq("id", id)
    .eq("student_id", userId);

  revalidatePath("/dashboard/hours");
  revalidatePath("/dashboard");
  redirect("/dashboard/hours");
}

/**
 * Employer confirms or corrects a student's hours for their own job.
 * The database trigger decides confirmed vs corrected, stamps who and
 * when, and preserves the student's original figure.
 */
export async function reviewHourEntry(formData: FormData) {
  const { supabase } = await requireEmployer();

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!id) redirect("/employer/hours");

  if (action === "confirm") {
    // Confirming as-submitted: write back the student's own figure.
    const { data: entry } = await supabase
      .from("hour_entries")
      .select("submitted_hours")
      .eq("id", id)
      .maybeSingle();
    if (!entry?.submitted_hours) redirect("/employer/hours?error=notfound");

    const { error } = await supabase
      .from("hour_entries")
      .update({ hours: entry.submitted_hours })
      .eq("id", id);
    if (error) {
      console.error("confirm hours failed", { code: error.code });
      redirect("/employer/hours?error=failed");
    }
  } else if (action === "correct") {
    const hours = Number(formData.get("hours"));
    const note = String(formData.get("employer_note") ?? "").trim();
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      redirect("/employer/hours?error=invalid");
    }
    const { error } = await supabase
      .from("hour_entries")
      .update({ hours, employer_note: note || null })
      .eq("id", id);
    if (error) {
      console.error("correct hours failed", { code: error.code });
      redirect("/employer/hours?error=failed");
    }
  }

  revalidatePath("/employer/hours");
  redirect("/employer/hours?reviewed=1");
}
