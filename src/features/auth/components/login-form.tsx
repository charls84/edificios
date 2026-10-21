'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '../services/actions'
import { FormMessage } from './form-message'

export function LoginForm({ initialError }: { initialError?: string }) {
  const t = useTranslations('auth')
  const [state, action, pending] = useActionState(login, { error: initialError })

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="etiqueta">{t('correo')}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
      </div>
      <div>
        <label htmlFor="password" className="etiqueta">{t('contrasena')}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="campo" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="boton">
        {pending ? t('entrando') : t('entrar')}
      </button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-rojo hover:underline">
          {t('olvidaste')}
        </Link>
      </p>
    </form>
  )
}
