import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth + role re-check for employer-side server code. Not a server
 * action — lives outside "use server" files so it never becomes a
 * public endpoint.
 */
export async function requireEmployer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/employer");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "employer") redirect("/dashboard");
  return { supabase, userId: user.id };
}

/** The employer org the signed-in user belongs to (phase 1: one org). */
export async function getMyEmployer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("employer_members")
    .select("member_role, employers(id, name, slug, city, website, description)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!data?.employers) return null;
  return { ...data.employers, member_role: data.member_role };
}
