'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useTransition } from 'react'
import { SemaforoBadge } from '@/features/ficha/components/badges'
import type { Etapa } from '@/shared/types/database'
import { cambiarEtapa } from '../services/edificios-actions'
import type { EdificioReal } from '../types'

const ETAPAS: Etapa[] = ['identificado', 'en_analisis', 'presentado', 'descartado', 'en_intervencion']

export function EncabezadoEdificio({ edificio, esAdmin }: { edificio: EdificioReal; esAdmin: boolean }) {
  const t = useTranslations()
  const [pendiente, iniciar] = useTransition()

  return (
    <header className="bento flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-medio-texto">{t('ficha.etiqueta')}</p>
        <h1 className="mt-1 truncate text-2xl font-bold">{edificio.nombre}</h1>
        <p className="mt-1 text-sm text-medio-texto">
          {[edificio.direccion, edificio.zona].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-1 text-sm text-medio-texto">
          CHIP {edificio.chip ?? t('ficha.chipPendiente')}
          {edificio.matricula && <> · {t('estudio.matricula')} {edificio.matricula}</>}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {edificio.semaforo && <SemaforoBadge semaforo={edificio.semaforo} />}
        <label className="text-sm">
          <span className="sr-only">{t('ficha.etapa', { etapa: '' })}</span>
          <select
            value={edificio.etapa}
            disabled={pendiente}
            onChange={(e) => iniciar(() => cambiarEtapa(edificio.id, e.target.value))}
            className="campo mt-0 w-auto rounded-full bg-piedra py-1 pr-8 text-xs font-medium"
          >
            {ETAPAS.map((e) => <option key={e} value={e}>{t(`etapas.${e}`)}</option>)}
          </select>
        </label>
        <Link href={`/edificios/${edificio.id}/editar`} className="rounded-xl border border-borde bg-white px-3 py-1.5 text-sm font-medium hover:bg-fondo">
          {t('estudio.editarDatos')}
        </Link>
        {esAdmin && null}
      </div>
    </header>
  )
}
