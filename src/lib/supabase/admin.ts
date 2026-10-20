import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente con secret key: salta RLS. Usar SOLO en server actions que ya
// verificaron que quien llama es admin.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
