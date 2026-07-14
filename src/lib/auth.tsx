import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session as SupabaseSession } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'

/*
 * One auth interface, two backends:
 *  - demo mode (no env vars): session lives in localStorage, no password.
 *  - live mode: Supabase Auth (managed provider per SECURITY.md 3.2 —
 *    password hashing, reset, verification and rate limiting are theirs).
 *    Tokens are handled by supabase-js; app code never writes tokens to
 *    storage itself.
 */

export type Role = 'student' | 'employer'

export interface SessionInfo {
  userId: string | null
  name: string
  email: string
  role: Role | null
}

interface AuthValue {
  mode: 'demo' | 'supabase'
  loading: boolean
  session: SessionInfo | null
  signInDemo: (name: string, email: string) => void
  signInSupabase: (email: string, password: string) => Promise<string | null>
  signUpSupabase: (
    name: string,
    email: string,
    password: string,
    role?: Role | null,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  setRole: (role: Role) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

const DEMO_KEY = 'laborlink.session'

function readDemoSession(): SessionInfo | null {
  try {
    const raw = localStorage.getItem(DEMO_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionInfo
    if (typeof parsed.name === 'string' && typeof parsed.email === 'string') {
      return { ...parsed, userId: null }
    }
  } catch {
    /* corrupt or unavailable storage: treat as signed out */
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode: 'demo' | 'supabase' = isSupabaseConfigured ? 'supabase' : 'demo'
  const [session, setSession] = useState<SessionInfo | null>(
    mode === 'demo' ? readDemoSession() : null,
  )
  const [loading, setLoading] = useState(mode === 'supabase')

  // Demo mode: persist to localStorage.
  useEffect(() => {
    if (mode !== 'demo') return
    try {
      if (session) localStorage.setItem(DEMO_KEY, JSON.stringify(session))
      else localStorage.removeItem(DEMO_KEY)
    } catch {
      /* non fatal */
    }
  }, [mode, session])

  // Live mode: track Supabase auth state and load the profile row.
  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    async function load(sbSession: SupabaseSession | null) {
      if (!supabase) return
      if (!sbSession?.user) {
        if (!cancelled) {
          setSession(null)
          setLoading(false)
        }
        return
      }
      const user = sbSession.user
      const { data } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .maybeSingle()

      let name = data?.name as string | undefined
      let role = (data?.role ?? null) as Role | null

      // Self heal if the signup trigger did not create the row.
      if (!data) {
        name =
          (user.user_metadata?.name as string | undefined) ??
          user.email?.split('@')[0] ??
          'New user'
        role = null
        await supabase
          .from('profiles')
          .insert({ id: user.id, name, role })
          .select()
      }

      if (!cancelled) {
        setSession({
          userId: user.id,
          name: name ?? 'New user',
          email: user.email ?? '',
          role,
        })
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => load(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      load(s)
    })
    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const value: AuthValue = {
    mode,
    loading,
    session,

    signInDemo: (name, email) => {
      if (mode !== 'demo') return
      setSession((prev) => ({
        userId: null,
        name,
        email,
        role: prev?.role ?? null,
      }))
    },

    signInSupabase: async (email, password) => {
      if (!supabase) return 'Supabase is not configured'
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return error ? error.message : null
    },

    signUpSupabase: async (name, email, password, role) => {
      if (!supabase)
        return { error: 'Supabase is not configured', needsConfirmation: false }
      // The handle_new_user trigger reads name and role from this metadata.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, ...(role ? { role } : {}) } },
      })
      if (error) return { error: error.message, needsConfirmation: false }
      // With email confirmation enabled there is no session yet.
      return { error: null, needsConfirmation: data.session === null }
    },

    setRole: async (role) => {
      if (mode === 'demo') {
        setSession((prev) => (prev ? { ...prev, role } : prev))
        return
      }
      if (!supabase || !session?.userId) return
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', session.userId)
      if (error) throw new Error(error.message)
      setSession((prev) => (prev ? { ...prev, role } : prev))
    },

    signOut: async () => {
      if (mode === 'supabase' && supabase) {
        await supabase.auth.signOut()
      }
      setSession(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
