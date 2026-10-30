'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'
import { FormMessage } from '@/features/auth/components/form-message'
import type { ActionState } from '@/features/auth/types'
import type { EdificioReal } from '../types'

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  inicial?: EdificioReal | null
}

function Campo({ id, label, ayuda, children }: { id: string; label: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta">{label}</label>
      {children}
      {ayuda && <p className="mt-1 text-xs text-medio-texto">{ayuda}</p>}
    </div>
  )
}

// Matricular (paso 1) o corregir los datos basicos del edificio
export function FormularioEdificio({ action, inicial }: Props) {
  const t = useTranslations('estudio.formulario')
  const [state, enviar, pending] = useActionState(action, {})
  const v = (k: keyof EdificioReal) => (inicial?.[k] == null ? '' : String(inicial[k]))

  return (
    <form action={enviar} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo id="nombre" label={t('nombre')} ayuda={t('nombreAyuda')}>
          <input id="nombre" name="nombre" required defaultValue={v('nombre')} className="campo" />
        </Campo>
        <Campo id="chip" label={t('chip')} ayuda={t('chipAyuda')}>
          <input id="chip" name="chip" defaultValue={v('chip')} className="campo uppercase" placeholder="AAA0000XXXX" />
        </Campo>
        <div className="md:col-span-2">
          <Campo id="direccion" label={t('direccion')} ayuda={t('direccionAyuda')}>
            <input id="direccion" name="direccion" required defaultValue={v('direccion')} className="campo" />
          </Campo>
        </div>
        <Campo id="matricula" label={t('matricula')} ayuda={t('matriculaAyuda')}>
          <input id="matricula" name="matricula" defaultValue={v('matricula')} className="campo" placeholder="50C-000000" />
        </Campo>
        <Campo id="zona" label={t('zona')}>
          <input id="zona" name="zona" defaultValue={v('zona')} className="campo" placeholder={t('zonaEj')} />
        </Campo>
        <Campo id="origen" label={t('origen')} ayuda={t('origenAyuda')}>
          <input id="origen" name="origen" defaultValue={v('origen')} className="campo" />
        </Campo>
        <Campo id="contacto" label={t('contacto')} ayuda={t('contactoAyuda')}>
          <input id="contacto" name="contacto" defaultValue={v('contacto')} className="campo" />
        </Campo>
        <Campo id="lat" label={t('lat')} ayuda={t('coordenadasAyuda')}>
          <input id="lat" name="lat" inputMode="decimal" defaultValue={v('lat')} className="campo" placeholder="4.5981" />
        </Campo>
        <Campo id="lng" label={t('lng')}>
          <input id="lng" name="lng" inputMode="decimal" defaultValue={v('lng')} className="campo" placeholder="-74.0758" />
        </Campo>
        <div className="md:col-span-2">
          <Campo id="notas" label={t('notas')}>
            <textarea id="notas" name="notas" defaultValue={v('notas')} className="campo min-h-20" />
          </Campo>
        </div>
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="boton w-auto">
        {pending ? t('guardando') : inicial ? t('guardar') : t('matricular')}
      </button>
    </form>
  )
}
