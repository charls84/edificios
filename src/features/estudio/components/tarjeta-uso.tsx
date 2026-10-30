'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { CATEGORIAS_USO } from '../catalogo/usos'
import { actualizarUso, eliminarUso } from '../services/estudio-actions'
import type { Riesgo, UsoCandidato, Veredicto } from '../types'

const VEREDICTOS: Veredicto[] = ['si', 'por_verificar', 'no']
const COLOR_VEREDICTO: Record<Veredicto, string> = {
  si: 'bg-verde text-white border-verde',
  por_verificar: 'bg-ambar text-white border-ambar',
  no: 'bg-rojo text-white border-rojo',
}

type Campos = Omit<UsoCandidato, 'id' | 'orden' | 'updatedAt'>

const aNumero = (v: string) => (v.trim() === '' ? null : Number(v.replace(/[^\d.,-]/g, '').replace(',', '.')))
const aTexto = (v: number | null) => (v == null ? '' : String(v))

function Prueba({ n, label, valor, nota, onValor, onNota, pendiente }: {
  n: number; label: string; valor: Veredicto; nota: string | null
  onValor: (v: Veredicto) => void; onNota: (v: string) => void; pendiente: boolean
}) {
  const t = useTranslations('estudio.usos')
  return (
    <div className="rounded-xl bg-fondo p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-medio-texto">{n} · {label}</p>
      <div role="group" aria-label={label} className="mt-2 flex flex-wrap gap-1">
        {VEREDICTOS.map((v) => (
          <button key={v} type="button" disabled={pendiente} aria-pressed={valor === v} onClick={() => onValor(v)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${valor === v ? COLOR_VEREDICTO[v] : 'border-borde bg-white text-medio-texto hover:border-torna'}`}>
            {t(`veredictos.${v}`)}
          </button>
        ))}
      </div>
      <input value={nota ?? ''} onChange={(e) => onNota(e.target.value)} placeholder={t('notaEj')} aria-label={t('notaDe', { prueba: label })} className="campo mt-2" />
    </div>
  )
}

function Numero({ id, label, ayuda, valor, onChange, sufijo }: { id: string; label: string; ayuda?: string; valor: string; onChange: (v: string) => void; sufijo?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="etiqueta">{label}</span>
      <span className="flex items-center gap-2">
        <input id={id} inputMode="decimal" value={valor} onChange={(e) => onChange(e.target.value)} className="campo" />
        {sufijo && <span className="mt-1 text-xs text-medio-texto">{sufijo}</span>}
      </span>
      {ayuda && <span className="block text-xs text-medio-texto">{ayuda}</span>}
    </label>
  )
}

// Una columna de la matriz de decision (bloque G): pruebas 1-3 y los numeros del bloque F
export function TarjetaUso({ edificioId, uso }: { edificioId: string; uso: UsoCandidato }) {
  const t = useTranslations('estudio.usos')
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [v, setV] = useState<Campos>(uso)
  const [numeros, setNumeros] = useState({
    m2Netos: aTexto(uso.m2Netos), canonM2: aTexto(uso.canonM2), ocupacion: String(Math.round(uso.ocupacion * 100)),
    inversion: aTexto(uso.inversion), gastosAnuales: aTexto(uso.gastosAnuales), mesesPrimerIngreso: aTexto(uso.mesesPrimerIngreso),
  })
  const [sucio, setSucio] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const set = (c: Partial<Campos>) => { setV((x) => ({ ...x, ...c })); setSucio(true) }
  const setN = (k: keyof typeof numeros, valor: string) => { setNumeros((x) => ({ ...x, [k]: valor })); setSucio(true) }

  function guardar() {
    const ocupacion = Math.min(100, Math.max(0, Number(numeros.ocupacion) || 0)) / 100
    const meses = aNumero(numeros.mesesPrimerIngreso)
    iniciar(async () => {
      const r = await actualizarUso(uso.id, edificioId, {
        ...v,
        legalNota: v.legalNota?.trim() || null, fisicoNota: v.fisicoNota?.trim() || null, demandaNota: v.demandaNota?.trim() || null,
        m2Netos: aNumero(numeros.m2Netos), canonM2: aNumero(numeros.canonM2), ocupacion,
        inversion: aNumero(numeros.inversion), gastosAnuales: aNumero(numeros.gastosAnuales),
        mesesPrimerIngreso: meses == null ? null : Math.round(meses),
      })
      setAviso(r.error ? t('errorGuardar') : t('guardado'))
      if (!r.error) { setSucio(false); router.refresh() }
    })
  }

  function eliminar() {
    if (!confirm(t('confirmarEliminar', { nombre: uso.nombre }))) return
    iniciar(async () => { await eliminarUso(uso.id, edificioId); router.refresh() })
  }

  const cerrado = v.legal === 'no' || v.fisico === 'no' || v.demanda === 'no'

  return (
    <section className={`bento space-y-4 ${cerrado ? 'border-rojo/30' : ''}`} aria-labelledby={`uso-${uso.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
          <label className="block">
            <span className="etiqueta">{t('nombre')}</span>
            <input id={`uso-${uso.id}`} value={v.nombre} onChange={(e) => set({ nombre: e.target.value })} className="campo font-semibold" />
          </label>
          <label className="block">
            <span className="etiqueta">{t('categoria')}</span>
            <select value={v.categoria} onChange={(e) => set({ categoria: e.target.value as Campos['categoria'] })} className="campo">
              {CATEGORIAS_USO.map((c) => <option key={c} value={c}>{t(`categorias.${c}`)}</option>)}
            </select>
          </label>
        </div>
        {cerrado && <span className="rounded-full bg-rojo-claro px-3 py-1 text-xs font-semibold text-rojo-oscuro">{t('columnaCerrada')}</span>}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Prueba n={1} label={t('pruebas.legal')} valor={v.legal} nota={v.legalNota} onValor={(x) => set({ legal: x })} onNota={(x) => set({ legalNota: x })} pendiente={pendiente} />
        <Prueba n={2} label={t('pruebas.fisica')} valor={v.fisico} nota={v.fisicoNota} onValor={(x) => set({ fisico: x })} onNota={(x) => set({ fisicoNota: x })} pendiente={pendiente} />
        <Prueba n={3} label={t('pruebas.demanda')} valor={v.demanda} nota={v.demandaNota} onValor={(x) => set({ demanda: x })} onNota={(x) => set({ demandaNota: x })} pendiente={pendiente} />
      </div>

      <details open={uso.inversion != null}>
        <summary className="cursor-pointer text-sm font-semibold">{t('numerosTitulo')}</summary>
        <p className="mt-1 text-xs text-medio-texto">{t('numerosTexto')}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Numero id={`m2-${uso.id}`} label={t('m2Netos')} ayuda={t('m2NetosAyuda')} valor={numeros.m2Netos} onChange={(x) => setN('m2Netos', x)} sufijo="m²" />
          <Numero id={`canon-${uso.id}`} label={t('canonM2')} ayuda={t('canonM2Ayuda')} valor={numeros.canonM2} onChange={(x) => setN('canonM2', x)} sufijo="COP" />
          <Numero id={`ocu-${uso.id}`} label={t('ocupacion')} ayuda={t('ocupacionAyuda')} valor={numeros.ocupacion} onChange={(x) => setN('ocupacion', x)} sufijo="%" />
          <Numero id={`inv-${uso.id}`} label={t('inversion')} ayuda={t('inversionAyuda')} valor={numeros.inversion} onChange={(x) => setN('inversion', x)} sufijo="COP" />
          <Numero id={`gas-${uso.id}`} label={t('gastosAnuales')} ayuda={t('gastosAnualesAyuda')} valor={numeros.gastosAnuales} onChange={(x) => setN('gastosAnuales', x)} sufijo="COP" />
          <Numero id={`mes-${uso.id}`} label={t('mesesPrimerIngreso')} ayuda={t('mesesPrimerIngresoAyuda')} valor={numeros.mesesPrimerIngreso} onChange={(x) => setN('mesesPrimerIngreso', x)} />
          <label className="block">
            <span className="etiqueta">{t('riesgo')}</span>
            <select value={v.riesgo} onChange={(e) => set({ riesgo: e.target.value as Riesgo })} className="campo">
              {(['bajo', 'medio', 'alto'] as Riesgo[]).map((r) => <option key={r} value={r}>{t(`riesgos.${r}`)}</option>)}
            </select>
          </label>
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={eliminar} disabled={pendiente} className="text-sm text-rojo-oscuro hover:underline">{t('eliminar')}</button>
        <div className="flex items-center gap-3">
          {aviso && <span role="status" className="text-sm text-medio-texto">{aviso}</span>}
          <button type="button" onClick={guardar} disabled={pendiente || !sucio} className="boton w-auto">{pendiente ? t('guardando') : t('guardar')}</button>
        </div>
      </div>
    </section>
  )
}
