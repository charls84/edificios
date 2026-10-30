import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Galeria } from '@/features/ficha/components/galeria'
import { SemaforoBadge } from '@/features/ficha/components/badges'
import type { InformeVisita } from '@/features/ficha/types'
import { ITEMS_GUIA } from '../catalogo/guia'
import { progresoDocumentos, progresoPrueba, resumenUsos } from '../lib/progreso'
import { fecha, tx } from '../lib/texto'
import type { AnalisisGuardado, EdificioReal, EstadoDocumentoEdificio, EstadoItemEdificio, ResultadoMayorMejorUso, ResultadoTamizaje, UsoCandidato } from '../types'
import { Progreso } from './progreso'

interface Props {
  edificio: EdificioReal
  docs: EstadoDocumentoEdificio[]
  items: EstadoItemEdificio[]
  usos: UsoCandidato[]
  informe: InformeVisita | null
  tamizaje: AnalisisGuardado<ResultadoTamizaje> | null
  mmu: AnalisisGuardado<ResultadoMayorMejorUso> | null
}

type Paso = { n: number; titulo: string; estado: 'hecho' | 'en_curso' | 'pendiente'; detalle: string; href: string }

function siguientePaso(pasos: Paso[]) {
  return pasos.find((p) => p.estado !== 'hecho') ?? pasos.at(-1)!
}

// Pestaña Resumen: donde va el estudio y cual es el siguiente paso
export async function ResumenEstudio({ edificio, docs, items, usos, informe, tamizaje, mmu }: Props) {
  const [t, locale] = await Promise.all([getTranslations('estudio.resumen'), getLocale()])
  const base = `/edificios/${edificio.id}`
  const pd = progresoDocumentos(docs)
  const legal = progresoPrueba(items, 'legal')
  const fisica = progresoPrueba(items, 'fisica')
  const financiera = progresoPrueba(items, 'financiera')
  const ru = resumenUsos(usos)
  const detalladoTotal = legal.total + fisica.total + financiera.total
  const detalladoHecho = legal.resueltos + fisica.resueltos + financiera.resueltos
  const recomendado = mmu ? mmu.resultado.usos.find((u) => u.id === mmu.resultado.recomendado) : null

  const pasos: Paso[] = [
    { n: 1, titulo: t('pasos.matricula'), estado: 'hecho', detalle: fecha(locale, edificio.createdAt), href: `${base}/editar` },
    { n: 2, titulo: t('pasos.minimo'), estado: pd.minimoListos === pd.minimo ? 'hecho' : pd.minimoListos > 0 ? 'en_curso' : 'pendiente', detalle: t('deN', { a: pd.minimoListos, b: pd.minimo }), href: `${base}/documentos` },
    { n: 3, titulo: t('pasos.usos'), estado: ru.total > 0 ? 'hecho' : 'pendiente', detalle: t('usosDetalle', { total: ru.total, pasan: ru.pasanEdificio }), href: `${base}/usos` },
    { n: 4, titulo: t('pasos.tamizaje'), estado: tamizaje ? 'hecho' : 'pendiente', detalle: tamizaje ? t(`semaforo.${tamizaje.resultado.semaforo}`) : t('sinCorrer'), href: `${base}/analisis` },
    { n: 5, titulo: t('pasos.detallado'), estado: detalladoHecho === detalladoTotal ? 'hecho' : detalladoHecho > 0 ? 'en_curso' : 'pendiente', detalle: t('deN', { a: detalladoHecho, b: detalladoTotal }), href: `${base}/checklist` },
    { n: 6, titulo: t('pasos.mmu'), estado: mmu ? 'hecho' : 'pendiente', detalle: recomendado ? recomendado.nombre : mmu ? t('sinViable') : t('sinCorrer'), href: `${base}/analisis` },
    { n: 7, titulo: t('pasos.informe'), estado: mmu ? 'en_curso' : 'pendiente', detalle: mmu ? t('informeListo') : t('informeTras'), href: `${base}/informe` },
  ]
  const siguiente = siguientePaso(pasos)
  const fotos = (informe?.secciones ?? []).flatMap((s) => s.fotos).slice(0, 8).map((f) => ({ src: f.src, alt: f.destacado || f.texto || t('fotoVisita') }))
  const bloqueos = tamizaje?.resultado.bloqueos ?? []

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {fotos.length > 0 && <div className="md:col-span-4"><Galeria fotos={fotos} titulo={edificio.nombre} /></div>}

      <section className="bento md:col-span-3">
        <h2 className="text-lg font-bold">{t('avance')}</h2>
        <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p) => (
            <li key={p.n}>
              <Link href={p.href} className={`block h-full rounded-xl border p-3 transition-colors hover:border-torna ${p === siguiente ? 'border-rojo bg-rojo-claro/40' : 'border-borde'}`}>
                <span className="flex items-center gap-2">
                  <span aria-hidden className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${p.estado === 'hecho' ? 'bg-verde text-white' : p.estado === 'en_curso' ? 'bg-ambar text-white' : 'bg-piedra text-medio-texto'}`}>
                    {p.estado === 'hecho' ? '✓' : p.n}
                  </span>
                  <span className="text-sm font-semibold">{p.titulo}</span>
                </span>
                <span className="mt-1 block text-xs text-medio-texto">{p.detalle}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="bento flex flex-col justify-between gap-3 bg-torna text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{t('siguiente')}</p>
          <p className="mt-1 text-lg font-bold">{siguiente.titulo}</p>
          <p className="mt-1 text-sm text-white/75">{t(`ayuda.${siguiente.n}`)}</p>
        </div>
        <Link href={siguiente.href} className="inline-flex items-center justify-center rounded-xl bg-rojo px-4 py-2 text-sm font-semibold text-white hover:bg-rojo-oscuro">{t('ir')}</Link>
      </section>

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

      <section className="bento md:col-span-2">
        <h2 className="font-semibold">{t('documentos')}</h2>
        <div className="mt-3 space-y-3">
          <Progreso label={t('minimo')} valor={pd.minimoListos} total={pd.minimo} destacado />
          <Progreso label={t('todos')} valor={pd.listos} total={pd.total} />
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
