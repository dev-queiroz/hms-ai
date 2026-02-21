import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/supabase'

/**
 * Cria um cliente Supabase para ser utilizado no browser (client-side)
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
