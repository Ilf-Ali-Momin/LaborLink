import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/*
 * The ONLY values that ever reach this client are the public project URL
 * and the anon key (safe to ship: every request is subject to Row Level
 * Security). The service_role key must never appear anywhere in this repo.
 *
 * Configure in .env.local (gitignored):
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Null when env vars are missing — the app then runs in local demo mode. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = supabase !== null

/** Use inside api.ts only; guarded call sites never run in demo mode. */
export function sb(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}
