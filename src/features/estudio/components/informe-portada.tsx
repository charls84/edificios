/* eslint-disable @next/next/no-img-element -- informe para imprimir: las fotos van tal cual, sin el optimizador */
import { getTranslations } from 'next-intl/server'
import type { EdificioReal } from '../types'

export interface FotoReporte {
  src: string
  titulo: string
  detalle?: string
}

export interface DatoClave {
  etiqueta: string
  valor: string
}

// Portada del informe impreso: marca, foto principal, datos del predio y la conclusión.
// Solo aparece al exportar a PDF; en pantalla la ficha ya tiene su encabezado.
export async function PortadaInforme({ edificio, foto, datos, conclusion, fecha }: {
  edificio: EdificioReal
  foto: FotoReporte | null
  datos: DatoClave[]
  conclusion: { decision: string; puntaje: string; detalle: string; traza?: string } | null
  fecha: string
}) {
  const t = await getTranslations('estudio.informe.portada')
  return (
    <section className="informe-portada hidden flex-col overflow-hidden rounded-none bg-white print:flex" aria-label={t('etiqueta')}>
      <div className="flex items-center justify-between bg-torna px-10 py-7">
        <img src="/brand/torna-logo-oscuro.png" alt="Torna · Rehabilitación urbana" className="h-14 w-auto" />
        <p className="text-right text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{t('tipo')}</p>
      </div>
      {foto && <img src={foto.src} alt={foto.titulo} className="h-[95mm] w-full object-cover" />}
      <div className="flex flex-1 flex-col px-10 pb-8 pt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rojo">{t('titulo')}</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-torna">{edificio.nombre}</h1>
        <p className="mt-1 text-base text-medio-texto">{[edificio.direccion, edificio.zona].filter(Boolean).join(' · ')}</p>

        <dl className="mt-6 grid grid-cols-3 gap-x-6 gap-y-3 border-y border-borde py-4">
          {datos.map((d) => (
            <div key={d.etiqueta}>
              <dt className="text-[10px] font-semibold uppercase tracking-widest text-medio-texto">{d.etiqueta}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-torna">{d.valor}</dd>
            </div>
          ))}
        </dl>

        {conclusion && (
          <div className="mt-6 flex items-stretch gap-4">
            <div className="flex w-36 shrink-0 flex-col justify-center rounded-lg bg-torna p-4 text-white">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">{t('puntaje')}</span>
              <span className="text-3xl font-bold tabular-nums">{conclusion.puntaje}</span>
            </div>
            <div className="flex-1 rounded-lg border-l-4 border-rojo bg-fondo p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-medio-texto">{t('conclusion')}</p>
              <p className="mt-1 text-lg font-bold text-torna">{conclusion.decision}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-medio-texto">{conclusion.detalle}</p>
              {conclusion.traza && <p className="mt-2 text-[10px] text-medio-texto">{conclusion.traza}</p>}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-borde pt-4 text-xs text-medio-texto">
          <span>{t('preparado', { fecha })}</span>
          <span className="font-semibold uppercase tracking-widest text-rojo">{t('confidencial')}</span>
        </div>
      </div>
    </section>
  )
}

// Registro fotográfico: cuadrícula de 3 columnas con pie de foto; no se parte entre páginas
export function RegistroFotografico({ fotos }: { fotos: FotoReporte[] }) {
  if (fotos.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {fotos.map((f) => (
        <figure key={f.src} className="informe-fila overflow-hidden rounded-lg border border-borde bg-white">
          <img src={f.src} alt={f.titulo} loading="eager" className="aspect-[4/3] w-full object-cover" />
          <figcaption className="px-2.5 py-1.5 text-xs">
            <span className="font-semibold text-torna">{f.titulo}</span>
            {f.detalle && <span className="block text-medio-texto">{f.detalle}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

// Franja de indicadores clave del resumen ejecutivo
export function IndicadoresClave({ datos }: { datos: { etiqueta: string; valor: string; tono?: 'verde' | 'ambar' | 'rojo' | 'torna' }[] }) {
  const tono = { verde: 'border-verde', ambar: 'border-ambar', rojo: 'border-rojo', torna: 'border-torna' }
  return (
    <dl className="informe-fila grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 print:grid-cols-6">
      {datos.map((d) => (
        <div key={d.etiqueta} className={`rounded-lg border-t-4 bg-fondo px-3 py-2.5 ${tono[d.tono ?? 'torna']}`}>
          <dt className="text-[10px] font-semibold uppercase leading-tight tracking-widest text-medio-texto">{d.etiqueta}</dt>
          <dd className="mt-1 text-base font-bold leading-tight text-torna">{d.valor}</dd>
        </div>
      ))}
    </dl>
  )
}
