'use client'

import { useActionState } from 'react'
import { FormMessage } from '@/features/auth/components/form-message'
import { inviteMember } from '../services/actions'

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteMember, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="etiqueta">Nombre</label>
        <input id="full_name" name="full_name" required className="campo" />
      </div>
      <div>
        <label htmlFor="email" className="etiqueta">Correo</label>
        <input id="email" name="email" type="email" required className="campo" />
      </div>
      <div>
        <label htmlFor="role" className="etiqueta">Rol</label>
        <select id="role" name="role" defaultValue="analista" className="campo">
          <option value="analista">Analista</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="boton">
        {pending ? 'Enviando…' : 'Enviar invitación'}
      </button>
    </form>
  )
}
