import { createClient } from '@supabase/supabase-js'

// 서버 전용 클라이언트 (서버 액션에서만 사용)
export const createSupabaseClient = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY가 설정되지 않았습니다.')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
