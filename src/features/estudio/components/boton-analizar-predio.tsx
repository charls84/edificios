'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { consultarAutomaticamente, pedirAnalisisIA } from '../services/auto-actions'
import { correrAnalisisFinanciero } from '../services/financiero-auto'

const ERRORES_CONSULTA = ['sinLote', 'sinRespuesta', 'invalido', 'demo'] as const

// Botón principal del flujo: (1) lee los documentos y consulta las fuentes en línea,
// (2) corre el analista de IA con todo lo que hay. Son dos llamadas para mostrar el avance.
export function BotonAnalizarPredio({ edificioId, yaAnalizado, iaDisponible }: { edificioId: string; yaAnalizado: boolean; iaDisponible: boolean }) {
  const t = useTranslations('estudio.flujo')
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [paso, setPaso] = useState<1 | 2 | 3 | null>(null)
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
      const avisos: string[] = c.error ? [t(`error.${ERRORES_CONSULTA.find((e) => e === c.error) ?? 'sinRespuesta'}`)] : []
      if (iaDisponible) {
        setPaso(2)
        const ia = await pedirAnalisisIA(edificioId)
        if (ia.error) avisos.push(t('error.ia'))
      }
      // Con los usos que dejó el analista (o el equipo): números, tamizaje y mayor y mejor uso
      setPaso(3)
      const f = await correrAnalisisFinanciero(edificioId)
      if (!f.mmu) avisos.push(t('error.mmu'))
      setAviso(avisos.length ? { tipo: 'error', texto: avisos.join(' ') } : { tipo: 'ok', texto: t('listo') })
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
