'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FUENTES, type CampoFuente, type Fuente } from '../catalogo/fuentes'
import { fecha, tx } from '../lib/texto'
import { setCampoFuente } from '../services/estudio-actions'
import { Progreso } from './progreso'

type Valores = Record<string, { texto: string; fecha: string }>

function Campo({ edificioId, fuente, campo, valor }: { edificioId: string; fuente: Fuente; campo: CampoFuente; valor?: { texto: string; fecha: string } }) {
  const t = useTranslations('estudio.fuentes')
  const locale = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [texto, setTexto] = useState(valor?.texto ?? '')
  const [guardado, setGuardado] = useState(false)
  const clave = `${fuente.codigo}.${campo.codigo}`

  const guardar = () => {
    if (texto.trim() === (valor?.texto ?? '')) return
    iniciar(async () => {
      const r = await setCampoFuente({ buildingId: edificioId, clave, texto: texto.trim() })
      setGuardado(!r.error)
      router.refresh()
    })
  }

  return (
    <li className="py-3">
      <label htmlFor={clave} className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{tx(campo.texto, locale)}</span>
        <span className="text-xs text-medio-texto">{t('alimenta', { codigos: campo.alimenta.join(', ') })}</span>
      </label>
      <textarea
        id={clave}
        value={texto}
        onChange={(e) => { setTexto(e.target.value); setGuardado(false) }}
        onBlur={guardar}
        placeholder={t('ejemplo', { texto: tx(campo.ejemplo, locale) })}
        className="campo mt-1 min-h-12"
        rows={2}
      />
      <p className="mt-1 text-xs text-medio-texto" role="status">
        {pendiente ? t('guardando') : guardado ? t('guardado') : valor ? t('consultado', { fecha: fecha(locale, valor.fecha) }) : ''}
      </p>
    </li>
  )
}

export function FuentesEnLinea({ edificioId, chip, valores }: { edificioId: string; chip: string | null; valores: Valores }) {
  const t = useTranslations('estudio.fuentes')
  const locale = useLocale()
  const [copiado, setCopiado] = useState(false)
  const conDatos = FUENTES.filter((f) => f.campos.some((c) => valores[`${f.codigo}.${c.codigo}`]))

  const copiarChip = async () => {
    if (!chip) return
    try {
      await navigator.clipboard.writeText(chip)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="bento">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold">{t('titulo')}</h2>
            <p className="mt-1 text-sm text-medio-texto">{t('texto')}</p>
          </div>
          {chip && (
            <button type="button" onClick={copiarChip} className="rounded-xl border border-borde bg-white px-3 py-2 text-sm font-medium hover:border-torna">
              {copiado ? t('chipCopiado') : t('copiarChip', { chip })}
            </button>
          )}
        </div>
        <div className="mt-4 max-w-md">
          <Progreso label={t('progreso')} valor={conDatos.length} total={FUENTES.length} destacado />
        </div>
      </section>

      {FUENTES.map((f, i) => (
        <section key={f.codigo} className="bento">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">
                <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-torna text-sm text-white">{i + 1}</span>
                {tx(f.nombre, locale)}
              </h3>
              <p className="mt-0.5 text-xs text-medio-texto">{f.entidad}</p>
              <p className="mt-2 max-w-2xl text-sm">{tx(f.comoBuscar, locale)}</p>
            </div>
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="boton w-auto">{t('abrir')}</a>
          </div>
          <ul className="mt-2 divide-y divide-borde">
            {f.campos.map((c) => (
              <Campo key={c.codigo} edificioId={edificioId} fuente={f} campo={c} valor={valores[`${f.codigo}.${c.codigo}`]} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
