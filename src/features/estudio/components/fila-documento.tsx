'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { formatoTamano, subirArchivo, urlArchivo } from '../lib/archivos'
import { fecha, tx } from '../lib/texto'
import { quitarArchivo, registrarArchivo, setEstadoDocumento } from '../services/estudio-actions'
import type { DocumentoCatalogo, EstadoDocumento, EstadoDocumentoEdificio } from '../types'

const ESTADOS: EstadoDocumento[] = ['pendiente', 'solicitado', 'cargado', 'validado', 'no_aplica']

const COLOR_ESTADO: Record<EstadoDocumento, string> = {
  pendiente: 'bg-piedra text-medio-texto',
  solicitado: 'bg-ambar-claro text-ambar',
  cargado: 'bg-torna/10 text-torna',
  validado: 'bg-verde-claro text-verde',
  no_aplica: 'bg-piedra text-medio-texto line-through',
}

const COLOR_DISPONIBILIDAD = {
  en_linea: 'bg-verde-claro text-verde',
  parcial: 'bg-ambar-claro text-ambar',
  no_en_linea: 'bg-piedra text-medio-texto',
}

const MAX_MB = 25

interface Props {
  edificioId: string
  doc: DocumentoCatalogo
  estado: EstadoDocumentoEdificio
}

export function FilaDocumento({ edificioId, doc, estado }: Props) {
  const t = useTranslations('estudio.documentos')
  const locale = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [subiendo, setSubiendo] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [notas, setNotas] = useState(estado.notas ?? '')
  const [mostrarNotas, setMostrarNotas] = useState(Boolean(estado.notas))

  function cambiarEstado(nuevo: EstadoDocumento) {
    iniciar(async () => {
      const r = await setEstadoDocumento({ buildingId: edificioId, codigo: doc.codigo, estado: nuevo })
      if (r.error) setError(t('errorGuardar'))
      else router.refresh()
    })
  }

  function guardarNotas() {
    if ((estado.notas ?? '') === notas.trim()) return
    iniciar(async () => {
      await setEstadoDocumento({ buildingId: edificioId, codigo: doc.codigo, estado: estado.estado, notas: notas.trim() || null })
      router.refresh()
    })
  }

  async function subir(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    setSubiendo(files.length)
    for (const file of Array.from(files)) {
      try {
        if (file.size > MAX_MB * 1024 * 1024) throw new Error('tamano')
        const ruta = await subirArchivo('documentos', edificioId, file, file.name)
        const r = await registrarArchivo({ buildingId: edificioId, codigo: doc.codigo, ruta, nombre: file.name, tamano: file.size, mime: file.type || null })
        if (r.error) throw new Error(r.error)
      } catch (e) {
        setError(e instanceof Error && e.message === 'tamano' ? t('errorTamano', { max: MAX_MB }) : t('errorSubir', { nombre: file.name }))
      }
      setSubiendo((n) => n - 1)
    }
    router.refresh()
  }

  function quitar(id: string, nombre: string) {
    if (!confirm(t('confirmarQuitar', { nombre }))) return
    iniciar(async () => {
      const r = await quitarArchivo(id)
      if (r.error) setError(t('errorGuardar'))
      router.refresh()
    })
  }

  return (
    <li className={`py-3 ${estado.estado === 'no_aplica' ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
            <span className="font-mono text-xs text-medio-texto">{doc.codigo}</span>
            {tx(doc.nombre, locale)}
            {doc.minimo && <span className="rounded-full bg-rojo-claro px-2 py-0.5 text-xs font-semibold text-rojo-oscuro">{t('minimo')}</span>}
            {doc.siAplica && <span className="rounded-full bg-piedra px-2 py-0.5 text-xs text-medio-texto">{t('siAplica')}</span>}
          </p>
          {doc.detalle && <p className="mt-0.5 text-xs text-medio-texto">{tx(doc.detalle, locale)}</p>}
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs ${COLOR_DISPONIBILIDAD[doc.disponibilidad]}`}>
            {t(`disponibilidad.${doc.disponibilidad}`)}
          </span>
        </div>
        <label className="text-sm">
          <span className="sr-only">{t('estadoDe', { documento: tx(doc.nombre, locale) })}</span>
          <select
            value={estado.estado}
            disabled={pendiente}
            onChange={(e) => cambiarEstado(e.target.value as EstadoDocumento)}
            className={`campo mt-0 w-auto rounded-full py-1 pr-8 text-xs font-medium ${COLOR_ESTADO[estado.estado]}`}
          >
            {ESTADOS.map((e) => <option key={e} value={e}>{t(`estados.${e}`)}</option>)}
          </select>
        </label>
      </div>

      {estado.archivos.length > 0 && (
        <ul className="mt-2 space-y-1">
          {estado.archivos.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-fondo px-3 py-1.5 text-sm">
              <a href={urlArchivo('documentos', a.ruta)} target="_blank" rel="noopener" className="min-w-0 flex-1 truncate font-medium text-torna hover:underline">
                {a.nombreArchivo}
              </a>
              <span className="text-xs text-medio-texto">{formatoTamano(a.tamano)} · {fecha(locale, a.fecha)}</span>
              <button type="button" onClick={() => quitar(a.id, a.nombreArchivo)} disabled={pendiente} className="text-xs text-rojo-oscuro hover:underline">
                {t('quitar')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <label className="cursor-pointer rounded-lg border border-borde bg-white px-3 py-1 font-medium hover:border-torna">
          {subiendo > 0 ? t('subiendo', { n: subiendo }) : t('cargarArchivo')}
          <input type="file" accept=".pdf,image/*,.dwg,.dxf,.xlsx,.docx" multiple className="sr-only" onChange={(e) => { subir(e.target.files); e.target.value = '' }} />
        </label>
        <button type="button" onClick={() => setMostrarNotas((v) => !v)} className="text-medio-texto hover:text-torna">
          {mostrarNotas ? t('ocultarNotas') : estado.notas ? t('verNotas') : t('agregarNota')}
        </button>
      </div>
      {mostrarNotas && (
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={guardarNotas}
          placeholder={t('notasEj')}
          aria-label={t('notasDe', { documento: tx(doc.nombre, locale) })}
          className="campo mt-2 min-h-16"
        />
      )}
      {error && <p role="alert" className="mt-2 text-sm text-rojo-oscuro">{error}</p>}
    </li>
  )
}
