'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'
import { requestPasswordReset } from '../services/actions'
import { FormMessage } from './form-message'

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const [state, action, pending] = useActionState(requestPasswordReset, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="etiqueta">{t('correo')}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="boton">
        {pending ? t('enviando') : t('enviarEnlace')}
      </button>
    </form>
  )
}
