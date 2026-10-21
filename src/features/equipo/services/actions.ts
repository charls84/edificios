'use server'

import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireAdmin } from '@/shared/lib/session'
import type { ActionState } from '@/features/auth/types'

const inviteSchema = z.object({
  email: z.email('correoInvalido'),
  full_name: z.string().trim().min(2, 'escribeNombre'),
  role: z.enum(['analista', 'admin']),
})

export async function inviteMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  const t = await getTranslations()
  if (IS_DEMO) return { error: t('errores.invitacionesDemo') }
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: t(`errores.${parsed.error.issues[0].message}`) }

  const { email, full_name, role } = parsed.data
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback?next=/update-password`,
  })
  if (error) return { error: t('errores.invitacionFallo') }

  // El perfil nace "sin_acceso" (trigger); aqui el admin le asigna el rol.
  const { error: roleError } = await admin
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', data.user.id)
  if (roleError) return { error: t('errores.rolFallo') }

  revalidatePath('/equipo')
  return { success: t('equipo.invitacionEnviada', { email }) }
}
