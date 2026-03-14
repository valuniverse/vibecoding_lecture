import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 브라우저: 세션을 쿠키에 저장 (미들웨어에서 읽을 수 있음)
// 서버: 세션 없이 사용 (서버 컴포넌트/라우트 핸들러는 별도 클라이언트 사용)
export const supabase =
  typeof window === 'undefined'
    ? createClient(url, key, { auth: { persistSession: false } })
    : createBrowserClient(url, key)
