import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Galeria } from '@/features/ficha/components/galeria'
import { SemaforoBadge } from '@/features/ficha/components/badges'
import type { InformeVisita } from '@/features/ficha/types'
import { ITEMS_GUIA } from '../catalogo/guia'
import { progresoDocumentos, progresoPrueba } from '../lib/progreso'
import { tx } from '../lib/texto'
import type { AnalisisGuardado, EdificioReal, EstadoDocumentoEdificio, EstadoItemEdificio, ResultadoMayorMejorUso, ResultadoTamizaje, UsoCandidato } from '../types'
import { FILTROS, UMBRALES } from '../catalogo/filtros'
import { calcularFiltros, COLOR_LECTURA, type EvaluacionCriterio } from '../lib/filtros'
import { CalificacionVisita } from '@/features/visita/components/calificacion-visita'
import { resumirVisita } from '@/features/visita/lib/calificacion'
import type { SugerenciaDecision } from '../lib/decision'
import { DecisionSugerida } from './decision-sugerida'
import { Progreso } from './progreso'
import { RadarFiltros } from './radar-filtros'

const TITULOS_FILTROS = Object.fromEntries(FILTROS.map((f) => [f.codigo, f.titulo]))

interface Props {
  edificio: EdificioReal
  docs: EstadoDocumentoEdificio[]
  items: EstadoItemEdificio[]
  usos: UsoCandidato[]
  informe: InformeVisita | null
  tamizaje: AnalisisGuardado<ResultadoTamizaje> | null
  mmu: AnalisisGuardado<ResultadoMayorMejorUso> | null
  filtros: EvaluacionCriterio[]
  fuentes: Record<string, { texto: string; fecha: string }>
  decision: SugerenciaDecision
  /** Tarjeta del analista de IA (se arma en la página) */
  ia: React.ReactNode
  /** Los cinco pasos del flujo (se arma en la página) */
  flujo: React.ReactNode
}

// Pestaña Resumen: donde va el estudio y cual es el siguiente paso
export async function ResumenEstudio({ edificio, docs, items, informe, tamizaje, filtros, decision, ia, flujo }: Props) {
  const [t, locale] = await Promise.all([getTranslations('estudio.resumen'), getLocale()])
  const base = `/edificios/${edificio.id}`
  const pd = progresoDocumentos(docs)
  const legal = progresoPrueba(items, 'legal')
  const fisica = progresoPrueba(items, 'fisica')
  const financiera = progresoPrueba(items, 'financiera')
  const rf = calcularFiltros(filtros)
  const tf = await getTranslations('estudio.filtros')

  const visita = resumirVisita(informe)
  const tva = await getTranslations('estudio.visitaAnalisis')
  const fotos = [
    ...(edificio.foto ? [{ src: edificio.foto, alt: edificio.nombre }] : []),
    ...(informe?.secciones ?? []).flatMap((s) => s.fotos).map((f) => ({ src: f.src, alt: f.destacado || f.texto || t('fotoVisita') })),
  ].slice(0, 8)
  const bloqueos = tamizaje?.resultado.bloqueos ?? []

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {fotos.length > 0 && <div className="md:col-span-4"><Galeria fotos={fotos} titulo={edificio.nombre} /></div>}

      {flujo}
      {ia}
      <DecisionSugerida sugerencia={decision} className="md:col-span-4" />
      {visita && visita.calificadas > 0 && (
        <section className="bento md:col-span-4" aria-labelledby="visita-resumen">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="visita-resumen" className="text-lg font-bold">{tva('titulo')}</h2>
            <Link href={`${base}/visita`} className="text-sm text-rojo hover:underline">{tva('ir')}</Link>
          </div>
          <CalificacionVisita resumen={visita} />
        </section>
      )}

      {(bloqueos.length > 0 || edificio.resumen) && (
        <section className={`bento md:col-span-4 ${bloqueos.length > 0 ? 'border-rojo/40 bg-rojo-claro' : ''}`}>
          <div className="flex flex-wrap items-center gap-3">
            {tamizaje && <SemaforoBadge semaforo={tamizaje.resultado.semaforo} />}
            <h2 className="font-semibold">{bloqueos.length > 0 ? t('bloqueos') : t('lectura')}</h2>
          </div>
          {edificio.resumen && <p className="mt-2 text-sm">{edificio.resumen}</p>}
          {bloqueos.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {bloqueos.map((c) => { const it = ITEMS_GUIA.find((x) => x.codigo === c); return <li key={c}>{c} · {it ? tx(it.texto, locale) : ''}</li> })}
            </ul>
          )}
        </section>
      )}

      <section className="bento md:col-span-4">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[240px_1fr]">
          <RadarFiltros filtros={rf.filtros} titulos={TITULOS_FILTROS} locale={locale} tamano={240} descripcion={tf('radar', { potencial: rf.potencial ?? 0 })} />
          <div>
            <h2 className="font-semibold">{tf('titulo')}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold tabular-nums">{rf.potencial ?? '—'}<span className="text-base text-medio-texto">/100</span></span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${COLOR_LECTURA[rf.lectura]}`}>{tf(`lectura.${rf.lectura}`)}</span>
            </p>
            <p className="mt-2 text-sm text-medio-texto">{tf(`explica.${rf.lectura}`, { alto: UMBRALES.alto, medio: UMBRALES.medio })}</p>
            <Link href={`${base}/filtros`} className="mt-3 inline-block text-sm text-rojo hover:underline">{t('verFiltros')}</Link>
          </div>
        </div>
      </section>

      <section className="bento md:col-span-2">
        <h2 className="font-semibold">{t('documentos')}</h2>
        <div className="mt-3 space-y-3">
          <Progreso label={t('minimo')} valor={pd.minimoListos} total={pd.minimo} destacado />
          <p className="text-sm text-medio-texto">{t('soloCertificado')}</p>
        </div>
        <Link href={`${base}/documentos`} className="mt-3 inline-block text-sm text-rojo hover:underline">{t('verDocumentos')}</Link>
      </section>

      <section className="bento md:col-span-2">
        <h2 className="font-semibold">{t('pruebas')}</h2>
        <div className="mt-3 space-y-3">
          <Progreso label={t('legal')} valor={legal.resueltos} total={legal.total} />
          <Progreso label={t('fisica')} valor={fisica.resueltos} total={fisica.total} />
          <Progreso label={t('financiera')} valor={financiera.resueltos} total={financiera.total} />
        </div>
        <Link href={`${base}/checklist`} className="mt-3 inline-block text-sm text-rojo hover:underline">{t('verChecklist')}</Link>
      </section>

      <section className="bento md:col-span-4">
        <h2 className="font-semibold">{t('datos')}</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            [t('origen'), edificio.origen], [t('contacto'), edificio.contacto], [t('zona'), edificio.zona],
            [t('ubicacion'), edificio.lat != null && edificio.lng != null ? `${edificio.lat}, ${edificio.lng}` : null],
          ].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-medio-texto">{k}</dt><dd className="font-medium">{v ?? '—'}</dd></div>
          ))}
        </dl>
        {edificio.notas && <p className="mt-3 whitespace-pre-line text-sm text-medio-texto">{edificio.notas}</p>}
      </section>
    </div>
  )
}
