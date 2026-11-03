'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { pedirAnalisisIA } from '../services/auto-actions'

const ERRORES = ['sinLlave', 'fallo', 'demo'] as const

export function BotonAnalista({ edificioId, hayAnalisis }: { edificioId: string; hayAnalisis: boolean }) {
  const t = useTranslations('estudio.analista')
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const pedir = () => {
    setError(null)
    iniciar(async () => {
      const r = await pedirAnalisisIA(edificioId)
      if (r.error) setError(t(`error.${ERRORES.find((e) => e === r.error) ?? 'fallo'}`))
      router.refresh()
    })
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={pedir} disabled={pendiente} className="boton w-auto print:hidden">
        {pendiente ? t('analizando') : hayAnalisis ? t('actualizar') : t('pedir')}
      </button>
      {error && <p role="alert" className="max-w-xs text-right text-xs text-rojo-oscuro">{error}</p>}
    </div>
  )
}
