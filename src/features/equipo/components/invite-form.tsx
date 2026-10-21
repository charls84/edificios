'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'
import { FormMessage } from '@/features/auth/components/form-message'
import { inviteMember } from '../services/actions'

export function InviteForm() {
  const t = useTranslations('equipo')
  const [state, action, pending] = useActionState(inviteMember, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="etiqueta">{t('nombre')}</label>
        <input id="full_name" name="full_name" required className="campo" />
      </div>
      <div>
        <label htmlFor="email" className="etiqueta">{t('correo')}</label>
        <input id="email" name="email" type="email" required className="campo" />
      </div>
      <div>
        <label htmlFor="role" className="etiqueta">{t('rol')}</label>
        <select id="role" name="role" defaultValue="analista" className="campo">
          <option value="analista">{t('roles.analista')}</option>
          <option value="admin">{t('roles.admin')}</option>
        </select>
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="boton">
        {pending ? t('enviando') : t('enviarInvitacion')}
      </button>
    </form>
  )
}
