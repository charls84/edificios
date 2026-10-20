'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireAdmin } from '@/shared/lib/session'
import type { ActionState } from '@/features/auth/types'

const inviteSchema = z.object({
  email: z.email('Correo no valido'),
  full_name: z.string().trim().min(2, 'Escribe el nombre'),
  role: z.enum(['analista', 'admin']),
})

export async function inviteMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  if (IS_DEMO) return { error: 'Las invitaciones están desactivadas en el modo demostración.' }
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { email, full_name, role } = parsed.data
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback?next=/update-password`,
  })
  if (error) return { error: 'No se pudo enviar la invitación. ¿Ya existe ese usuario?' }

  // El perfil nace "sin_acceso" (trigger); aqui el admin le asigna el rol.
  const { error: roleError } = await admin
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', data.user.id)
  if (roleError) return { error: 'Invitación enviada, pero no se pudo asignar el rol.' }

  revalidatePath('/equipo')
  return { success: `Invitación enviada a ${email}.` }
}
