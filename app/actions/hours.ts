"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  });

  if (error) {
    console.error("addHourEntry failed", { code: error.code });
    redirect("/dashboard/hours?error=failed");
  }

  revalidatePath("/dashboard/hours");
  revalidatePath("/dashboard");
  redirect("/dashboard/hours");
}

export async function deleteHourEntry(formData: FormData) {
  const { supabase, userId } = await requireStudent();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/hours");

  // RLS restricts to own rows; the filter here is defense in depth.
  await supabase.from("hour_entries").delete().eq("id", id).eq("student_id", userId);

  revalidatePath("/dashboard/hours");
  revalidatePath("/dashboard");
  redirect("/dashboard/hours");
}
