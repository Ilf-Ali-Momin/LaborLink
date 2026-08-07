"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-path";
import { siteUrl } from "@/lib/site";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}


export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "employer" ? "employer" : "student";
  const next = safeInternalPath(formData.get("next"));

  if (!email || password.length < 8) {
    redirect(`/signup?role=${role}&error=invalid${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The role is written into the JWT metadata once, at signup; the
      // database trigger turns it into a permanent profiles.role.
      data: { role },
      // Without this, Supabase falls back to the project's Site URL — which
      // is how confirmation emails ended up pointing at localhost.
      emailRedirectTo: `${siteUrl()}/auth/confirm${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });

  if (error) {
    // Generic message; details (including whether the email exists) stay
    // server-side.
    redirect(`/signup?role=${role}&error=failed${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  // When the project requires email confirmation, signUp succeeds but
  // issues no session. Sending the user into the app here would bounce
  // them straight back to /login, where a correct password looks wrong.
  if (!data.session) {
    redirect(`/signup?role=${role}&check_email=1`);
  }

  redirect(next ?? (role === "employer" ? "/employer" : "/dashboard/profile?welcome=1"));
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(formData.get("next"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // One identical response for every failure: wrong password, no such
    // account, or unconfirmed email. Distinguishing "unconfirmed" would
    // confirm to an attacker that the password they just guessed is
    // correct — a credential oracle worth more to them than access, since
    // people reuse passwords. The generic message carries a confirmation
    // hint for everyone, so a legitimate user still knows what to do.
    const suffix = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`/login?error=1${suffix}`);
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
