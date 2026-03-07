import { createClient } from '@supabase/supabase-js'

const isServer = typeof window === 'undefined'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: !isServer,
      autoRefreshToken: !isServer,
      detectSessionInUrl: !isServer,
    },
  }
)
