'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { consultarAutomaticamente, pedirAnalisisIA } from '../services/auto-actions'

const ERRORES_CONSULTA = ['sinLote', 'sinRespuesta', 'invalido', 'demo'] as const

// Botón principal del flujo: (1) lee los documentos y consulta las fuentes en línea,
// (2) corre el analista de IA con todo lo que hay. Son dos llamadas para mostrar el avance.
export function BotonAnalizarPredio({ edificioId, yaAnalizado, iaDisponible }: { edificioId: string; yaAnalizado: boolean; iaDisponible: boolean }) {
  const t = useTranslations('estudio.flujo')
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [paso, setPaso] = useState<1 | 2 | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const analizar = () => {
    setAviso(null)
    iniciar(async () => {
      setPaso(1)
      const c = await consultarAutomaticamente({ buildingId: edificioId })
      if (c.error === 'demo') {
        setAviso({ tipo: 'error', texto: t('error.demo') })
        setPaso(null)
        return
      }
      const avisoConsulta = c.error ? t(`error.${ERRORES_CONSULTA.find((e) => e === c.error) ?? 'sinRespuesta'}`) : null
      if (iaDisponible) {
        setPaso(2)
        const ia = await pedirAnalisisIA(edificioId)
        setAviso(ia.error ? { tipo: 'error', texto: [avisoConsulta, t('error.ia')].filter(Boolean).join(' ') } : { tipo: avisoConsulta ? 'error' : 'ok', texto: avisoConsulta ?? t('listo') })
      } else {
        setAviso({ tipo: avisoConsulta ? 'error' : 'ok', texto: avisoConsulta ?? t('listoSinIa') })
      }
      setPaso(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={analizar} disabled={pendiente} className="boton w-full sm:w-auto">
        {pendiente ? t(`paso${paso ?? 1}`) : yaAnalizado ? t('repetir') : t('analizar')}
      </button>
      {pendiente && <p className="text-xs text-medio-texto" aria-live="polite">{t('espera')}</p>}
      {aviso && (
        <p role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`rounded-xl px-3 py-2 text-sm ${aviso.tipo === 'error' ? 'bg-rojo-claro text-rojo-oscuro' : 'bg-verde-claro text-verde'}`}>{aviso.texto}</p>
      )}
    </div>
  )
}
