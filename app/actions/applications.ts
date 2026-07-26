"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions are public HTTP endpoints (SECURITY.md): auth and role
 * are re-checked here first, regardless of what the UI showed.
 */
export async function applyToListing(formData: FormData) {
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

  const listingId = String(formData.get("listing_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";

  if (!listingId || !consent) {
    redirect(`/jobs/${slug}?error=consent`);
  }

  // The snapshot is what the student consents to share for THIS
  // application. Explicit fields only — never the whole profile row.
  const { data: sp } = await supabase
    .from("student_profiles")
    .select("first_name, last_name, university, degree_program, semester, city, languages, work_auth")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sp || !sp.first_name) {
    redirect(`/dashboard/profile?complete=1&then=${encodeURIComponent(`/jobs/${slug}`)}`);
  }

  const snapshot = {
    first_name: sp.first_name,
    last_name: sp.last_name,
    university: sp.university,
    degree_program: sp.degree_program,
    semester: sp.semester,
    city: sp.city,
    languages: sp.languages,
    // Derived boolean only. The permit itself never crosses this boundary.
    work_authorized: sp.work_auth === "eu_citizen" || sp.work_auth === "permit_verified",
    work_auth_self_declared: true,
  };

  const { error } = await supabase.from("applications").insert({
    listing_id: listingId,
    student_id: user.id,
    message: message || null,
    snapshot,
  });

  if (error) {
    // Unique violation = already applied. Anything else: generic message,
    // details stay server-side.
    if (error.code === "23505") {
      redirect(`/jobs/${slug}?error=duplicate`);
    }
    console.error("applyToListing failed", { code: error.code });
    redirect(`/jobs/${slug}?error=failed`);
  }

  revalidatePath("/dashboard/applications");
  redirect(`/jobs/${slug}?applied=1`);
}

export async function withdrawApplication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/applications");

  // RLS only allows the owning student to set status = withdrawn.
  const { error } = await supabase
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", id)
    .eq("student_id", user.id);

  if (error) {
    console.error("withdrawApplication failed", { code: error.code });
  }

  revalidatePath("/dashboard/applications");
  redirect("/dashboard/applications");
}
