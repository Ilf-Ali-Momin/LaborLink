"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-path";

const WORK_AUTH_VALUES = [
  "eu_citizen",
  "permit_verified",
  "permit_pending",
  "unknown",
] as const;

export async function saveStudentProfile(formData: FormData) {
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

  const workAuthRaw = String(formData.get("work_auth") ?? "unknown");
  const workAuth = WORK_AUTH_VALUES.includes(
    workAuthRaw as (typeof WORK_AUTH_VALUES)[number],
  )
    ? (workAuthRaw as (typeof WORK_AUTH_VALUES)[number])
    : "unknown";

  const semesterRaw = Number(formData.get("semester"));
  const languages = String(formData.get("languages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  const values = {
    user_id: user.id,
    first_name: String(formData.get("first_name") ?? "").trim().slice(0, 100),
    last_name: String(formData.get("last_name") ?? "").trim().slice(0, 100),
    city: String(formData.get("city") ?? "").trim().slice(0, 100) || null,
    university: String(formData.get("university") ?? "").trim().slice(0, 200) || null,
    degree_program: String(formData.get("degree_program") ?? "").trim().slice(0, 200) || null,
    semester:
      Number.isInteger(semesterRaw) && semesterRaw >= 1 && semesterRaw <= 30
        ? semesterRaw
        : null,
    languages,
    bio: String(formData.get("bio") ?? "").trim().slice(0, 2000) || null,
    work_auth: workAuth,
    updated_at: new Date().toISOString(),
  };

  if (!values.first_name) {
    redirect("/dashboard/profile?error=name");
  }

  const { error } = await supabase.from("student_profiles").upsert(values);
  if (error) {
    console.error("saveStudentProfile failed", { code: error.code });
    redirect("/dashboard/profile?error=failed");
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  const then = safeInternalPath(formData.get("then"));
  if (then) redirect(then);
  redirect("/dashboard/profile?saved=1");
}
