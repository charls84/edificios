import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/shared/types/database'
import { IS_DEMO } from './demo'

const DEMO_PROFILE: Profile = {
  id: 'demo',
  email: 'demo@ejemplo.co',
  full_name: 'Usuario de demostración',
  role: 'admin',
  created_at: '2026-10-20T00:00:00Z',
  updated_at: '2026-10-20T00:00:00Z',
}

// Devuelve el perfil del usuario con sesion; si no hay sesion, manda a /login.
export async function requireProfile(): Promise<Profile> {
  if (IS_DEMO) return DEMO_PROFILE
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!data) redirect('/login')
  return data as Profile
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile()
  if (profile.role !== 'admin') redirect('/dashboard')
  return profile
}
