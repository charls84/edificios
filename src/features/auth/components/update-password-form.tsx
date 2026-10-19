'use client'

import { useActionState } from 'react'
import { updatePassword } from '../services/actions'
import { FormMessage } from './form-message'

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="etiqueta">Nueva contraseña</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="campo" />
      </div>
      <div>
        <label htmlFor="confirm" className="etiqueta">Repite la contraseña</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="campo" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="boton">
        {pending ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  )
}
