import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Dev bypass: return mock client with fake user when Supabase not configured
    const devUser = {
      id: 'dev-user',
      email: 'dev@genexlabs.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    }
    return {
      auth: {
        getUser: async () => ({ data: { user: devUser }, error: null }),
        getSession: async () => ({ data: { session: { user: devUser } }, error: null }),
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
          callback('SIGNED_IN', { user: devUser })
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
        signInWithOtp: async () => ({ error: new Error('Supabase not configured — using dev mode') }),
        signOut: async () => ({ error: null }),
      },
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}
