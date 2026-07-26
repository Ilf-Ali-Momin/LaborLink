import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

/**
 * The current user and their role, or null. Every protected page and
 * every server action calls this (or checks equivalently) — middleware
 * is not the security boundary.
 */
export async function getSessionProfile(): Promise<
  { userId: string; email: string | null; role: UserRole } | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { userId: user.id, email: user.email ?? null, role: profile.role };
}
