"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function safeNext(raw: FormDataEntryValue | null): string | null {
  const value = typeof raw === "string" ? raw : "";
  // Internal paths only — never redirect off-site.
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "employer" ? "employer" : "student";
  const next = safeNext(formData.get("next"));

  if (!email || password.length < 8) {
    redirect(`/signup?role=${role}&error=invalid${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // The role is written into the JWT metadata once, at signup; the
    // database trigger turns it into a permanent profiles.role.
    options: { data: { role } },
  });

  if (error) {
    // Generic message; details (including whether the email exists) stay
    // server-side.
    redirect(`/signup?role=${role}&error=failed${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  redirect(next ?? (role === "employer" ? "/employer" : "/dashboard/profile?welcome=1"));
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Identical response whether the account exists or not.
    redirect(`/login?error=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  if (next) redirect(next);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  redirect(profile?.role === "employer" ? "/employer" : "/dashboard");
}
