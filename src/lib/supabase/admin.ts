import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente con service role: salta RLS. Usar SOLO en server actions que ya
// verificaron que quien llama es admin.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
