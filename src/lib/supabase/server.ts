import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Dev bypass: return fake admin user when Supabase not configured
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
      },
    } as unknown as ReturnType<typeof createServerClient>
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method is called from a Server Component.
        }
      },
    },
  })
}
