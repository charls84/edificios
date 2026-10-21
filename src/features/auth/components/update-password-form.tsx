'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'
import { updatePassword } from '../services/actions'
import { FormMessage } from './form-message'

export function UpdatePasswordForm() {
  const t = useTranslations('auth')
  const [state, action, pending] = useActionState(updatePassword, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="etiqueta">{t('nuevaContrasena')}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="campo" />
      </div>
      <div>
        <label htmlFor="confirm" className="etiqueta">{t('repiteContrasena')}</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="campo" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="boton">
        {pending ? t('guardando') : t('guardarContrasena')}
      </button>
    </form>
  )
}
