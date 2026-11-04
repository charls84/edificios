'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { NotaInforme as Nota, SeccionEditable } from '../lib/informe-ediciones'
import { fechaHora } from '../lib/texto'
import { guardarNotaInforme } from '../services/informe-ediciones'

const DECISIONES = ['continuar', 'continuar_condiciones', 'descartar', 'falta_informacion'] as const

// Nota editable de una sección del informe. En pantalla se edita; en el PDF sale con la
// trazabilidad: quién la escribió, cuándo (hora de Bogotá) y en qué sección.
export function NotaInforme({ edificioId, clave, seccion, nota, conDecision = false }: {
  edificioId: string
  clave: SeccionEditable
  seccion: string
  nota: Nota | null
  conDecision?: boolean
}) {
  const t = useTranslations('estudio.informe.edicion')
  const td = useTranslations('estudio.decision.opcion')
  const locale = useLocale()
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(nota?.texto ?? '')
  const [decision, setDecision] = useState<Nota['decision']>(nota?.decision ?? null)
  const [pendiente, iniciar] = useTransition()
  const [error, setError] = useState(false)
  const hayNota = Boolean(nota?.texto || nota?.decision)

  const guardar = () => iniciar(async () => {
    const r = await guardarNotaInforme({ buildingId: edificioId, clave, texto, decision: conDecision ? decision : null })
    setError(Boolean(r.error))
    if (!r.error) { setEditando(false); router.refresh() }
  })

  if (editando) {
    return (
      <div className="space-y-2 rounded-lg border-2 border-torna/30 bg-white p-3 print:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-torna">{t('editando', { seccion })}</p>
        {conDecision && (
          <label className="block text-sm">
            <span className="etiqueta">{t('decision')}</span>
            <select value={decision ?? ''} onChange={(e) => setDecision((e.target.value || null) as Nota['decision'])} className="campo">
              <option value="">{t('decisionAuto')}</option>
              {DECISIONES.map((d) => <option key={d} value={d}>{td(d)}</option>)}
            </select>
          </label>
        )}
        <label className="block text-sm">
          <span className="etiqueta">{conDecision ? t('textoConclusion') : t('texto')}</span>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} maxLength={4000} className="campo" placeholder={t('ejemplo')} />
        </label>
        <p className="text-xs text-medio-texto">{t('aviso')}</p>
        {error && <p role="alert" className="text-xs text-rojo-oscuro">{t('error')}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={guardar} disabled={pendiente} className="boton w-auto">{pendiente ? t('guardando') : t('guardar')}</button>
          <button type="button" onClick={() => { setEditando(false); setTexto(nota?.texto ?? ''); setDecision(nota?.decision ?? null) }} className="rounded-xl border border-borde px-4 py-2 text-sm">{t('cancelar')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {hayNota && (
        <div className="informe-fila rounded-lg border-l-4 border-torna bg-fondo p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-torna">{conDecision ? t('conclusionEquipo') : t('notaEquipo')}</p>
          {nota?.decision && <p className="mt-1 font-semibold text-torna">{td(nota.decision)}</p>}
          {nota?.texto && <p className="mt-1 whitespace-pre-line">{nota.texto}</p>}
          <p className="mt-1.5 text-[10px] text-medio-texto">{t('traza', { autor: nota!.autor, fecha: fechaHora(locale, nota!.fecha), seccion })}</p>
        </div>
      )}
      <button type="button" onClick={() => setEditando(true)} className="text-xs font-semibold text-rojo hover:underline print:hidden">
        {hayNota ? t('editar') : conDecision ? t('agregarConclusion') : t('agregar')}
      </button>
    </div>
  )
}
