import { getLocale, getTranslations } from 'next-intl/server'
import { SemaforoBadge } from '@/features/ficha/components/badges'
import type { InformeVisita } from '@/features/ficha/types'
import { DOCUMENTOS, documentoPorCodigo } from '../catalogo/documentos'
import { ITEMS_GUIA, itemsDelBloque } from '../catalogo/guia'
import { COP, fecha, numero, porcentaje, tx } from '../lib/texto'
import type { AnalisisGuardado, EdificioReal, EstadoDocumentoEdificio, EstadoItemEdificio, ResultadoMayorMejorUso, ResultadoTamizaje, UsoCandidato } from '../types'
import { BotonImprimir } from './boton-imprimir'
import { ResultadoMayorMejorUso as VistaMmu } from './resultado-mmu'

interface Props {
  edificio: EdificioReal
  docs: EstadoDocumentoEdificio[]
  items: EstadoItemEdificio[]
  usos: UsoCandidato[]
  informe: InformeVisita | null
  tamizaje: AnalisisGuardado<ResultadoTamizaje> | null
  mmu: AnalisisGuardado<ResultadoMayorMejorUso> | null
}

const ESTADO_COLOR: Record<EstadoItemEdificio['estado'], string> = {
  pendiente: 'bg-piedra text-medio-texto',
  cumple: 'bg-verde-claro text-verde',
  no_cumple: 'bg-rojo-claro text-rojo-oscuro',
  por_verificar: 'bg-ambar-claro text-ambar',
  no_aplica: 'bg-piedra text-medio-texto',
}

function Capitulo({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="bento break-inside-avoid print:border-0 print:p-0 print:shadow-none" aria-labelledby={`cap-${n}`}>
      <h2 id={`cap-${n}`} className="text-lg font-bold"><span className="mr-2 text-rojo">{n}.</span>{titulo}</h2>
      <div className="mt-3 space-y-3 text-sm">{children}</div>
    </section>
  )
}

async function Bloque({ codigo, estados }: { codigo: string; estados: Map<string, EstadoItemEdificio> }) {
  const [t, locale] = await Promise.all([getTranslations('estudio.checklist.estados'), getLocale()])
  return (
    <ul className="divide-y divide-borde">
      {itemsDelBloque(codigo).map((item) => {
        const e = estados.get(item.codigo)
        return (
          <li key={item.codigo} className="flex items-start justify-between gap-3 py-1.5">
            <span>
              <span className="mr-1.5 font-mono text-xs text-medio-texto">{item.codigo}</span>{tx(item.texto, locale)}
              {e?.nota && <span className="block text-xs text-medio-texto">{e.nota}</span>}
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${ESTADO_COLOR[e?.estado ?? 'pendiente']}`}>{t(e?.estado ?? 'pendiente')}</span>
          </li>
        )
      })}
    </ul>
  )
}

// Informe de viabilidad: los 10 capitulos de la guia (seccion 07), armados con lo que hay en la ficha
export async function Informe({ edificio, docs, items, usos, informe, tamizaje, mmu }: Props) {
  const [t, locale] = await Promise.all([getTranslations('estudio.informe'), getLocale()])
  const estados = new Map(items.map((i) => [i.codigo, i]))
  const estadoDoc = new Map(docs.map((d) => [d.codigo, d]))
  const r = mmu?.resultado ?? null
  const recomendado = r ? r.usos.find((u) => u.id === r.recomendado) ?? null : null
  const cargados = DOCUMENTOS.filter((d) => ['cargado', 'validado'].includes(estadoDoc.get(d.codigo)?.estado ?? ''))
  const faltantes = DOCUMENTOS.filter((d) => !d.siAplica && !['cargado', 'validado', 'no_aplica'].includes(estadoDoc.get(d.codigo)?.estado ?? ''))
  const porVerificar = ITEMS_GUIA.filter((i) => estados.get(i.codigo)?.estado === 'por_verificar')
  const fragiles = r ? r.usos.filter((u) => u.viable && u.sensibilidad.canonMenos10 != null && u.sensibilidad.canonMenos10 < r.parametros.tasaMinima) : []
  const hoy = fecha(locale, new Date().toISOString())

  return (
    <article className="space-y-4">
      <header className="bento flex flex-wrap items-start justify-between gap-4 bg-torna text-white print:bg-white print:text-torna">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 print:text-medio-texto">{t('etiqueta')}</p>
          <h1 className="mt-1 text-2xl font-bold">{edificio.nombre}</h1>
          <p className="mt-1 text-sm text-white/80 print:text-medio-texto">{edificio.direccion} · CHIP {edificio.chip ?? '—'} · {t('matricula')} {edificio.matricula ?? '—'}</p>
          <p className="mt-1 text-xs text-white/60 print:text-medio-texto">{t('corte', { fecha: hoy })}</p>
        </div>
        <BotonImprimir />
      </header>

      {!mmu && <p className="rounded-xl bg-ambar-claro px-4 py-3 text-sm">{t('borrador')}</p>}

      <Capitulo n={1} titulo={t('cap.1')}>
        {recomendado ? (
          <>
            <p className="text-lg font-semibold">{t('usoRecomendado', { uso: recomendado.nombre })}</p>
            <p>{t('porque', { rentabilidad: porcentaje(locale, recomendado.rentabilidad ?? 0), vpn: COP(locale, recomendado.vpn ?? 0), recuperacion: numero(locale, recomendado.recuperacionAnios ?? 0) })}</p>
          </>
        ) : <p className="text-medio-texto">{t('sinRecomendacion')}</p>}
        {tamizaje && (
          <p className="flex items-center gap-2"><SemaforoBadge semaforo={tamizaje.resultado.semaforo} /> {t('tamizajeDel', { fecha: fecha(locale, tamizaje.fecha) })}</p>
        )}
        {edificio.resumen && <p>{edificio.resumen}</p>}
      </Capitulo>

      <Capitulo n={2} titulo={t('cap.2')}>
        <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[[t('direccion'), edificio.direccion], ['CHIP', edificio.chip], [t('matricula'), edificio.matricula], [t('zona'), edificio.zona]].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-medio-texto">{k}</dt><dd className="font-medium">{v ?? '—'}</dd></div>
          ))}
        </dl>
        <Bloque codigo="A" estados={estados} />
        <p className="text-xs text-medio-texto">{t('documentosCargados', { n: cargados.length })}: {cargados.map((d) => d.codigo).join(', ') || '—'}</p>
      </Capitulo>

      <Capitulo n={3} titulo={t('cap.3')}><Bloque codigo="B" estados={estados} /></Capitulo>

      <Capitulo n={4} titulo={t('cap.4')}>
        {informe && (
          <div className="rounded-xl bg-fondo p-3">
            <p className="font-semibold">{informe.resumenTitulo || informe.titulo}</p>
            <p className="text-xs text-medio-texto">{[informe.fecha, informe.autor].filter(Boolean).join(' · ')}</p>
            {informe.hallazgos.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5">{informe.hallazgos.map((h) => <li key={h.titulo}><strong>{h.titulo}.</strong> {h.texto}</li>)}</ul>
            )}
          </div>
        )}
        <Bloque codigo="C" estados={estados} />
        <h3 className="font-semibold">{t('pruebaRapida')}</h3>
        <Bloque codigo="CV" estados={estados} />
      </Capitulo>

      <Capitulo n={5} titulo={t('cap.5')}><Bloque codigo="D" estados={estados} /></Capitulo>

      <Capitulo n={6} titulo={t('cap.6')}>
        <Bloque codigo="E" estados={estados} />
        {usos.length > 0 && (
          <ul className="divide-y divide-borde">
            {usos.map((u) => (
              <li key={u.id} className="py-1.5"><strong>{u.nombre}</strong> · {t('demanda')}: {t(`veredicto.${u.demanda}`)}{u.demandaNota && <span className="block text-xs text-medio-texto">{u.demandaNota}</span>}</li>
            ))}
          </ul>
        )}
      </Capitulo>

      <Capitulo n={7} titulo={t('cap.7')}>
        <Bloque codigo="F" estados={estados} />
        {r && <p className="text-xs text-medio-texto">{t('parametros', { tasa: porcentaje(locale, r.parametros.tasaMinima), anios: r.parametros.horizonteAnios, salida: r.parametros.tasaSalida ? porcentaje(locale, r.parametros.tasaSalida) : '—' })}</p>}
      </Capitulo>

      <Capitulo n={8} titulo={t('cap.8')}>
        {r ? <VistaMmu r={r} /> : <p className="text-medio-texto">{t('sinMatriz')}</p>}
      </Capitulo>

      <Capitulo n={9} titulo={t('cap.9')}>
        <ul className="list-disc space-y-1 pl-5">
          {(tamizaje?.resultado.bloqueos ?? []).map((c) => { const it = ITEMS_GUIA.find((x) => x.codigo === c); return <li key={c} className="text-rojo-oscuro">{c} · {it ? tx(it.texto, locale) : ''}</li> })}
          {usos.filter((u) => u.riesgo === 'alto').map((u) => <li key={u.id}>{t('riesgoAlto', { uso: u.nombre })}</li>)}
          {fragiles.map((u) => <li key={u.id}>{t('fragil', { uso: u.nombre })}</li>)}
          {r?.loteVacioManda && <li>{t('loteVacio')}</li>}
        </ul>
        {!tamizaje?.resultado.bloqueos.length && !fragiles.length && !usos.some((u) => u.riesgo === 'alto') && <p className="text-medio-texto">{t('sinRiesgos')}</p>}
      </Capitulo>

      <Capitulo n={10} titulo={t('cap.10')}>
        {porVerificar.length > 0 && (
          <>
            <h3 className="font-semibold">{t('porVerificar', { n: porVerificar.length })}</h3>
            <ul className="list-disc space-y-1 pl-5">{porVerificar.map((i) => <li key={i.codigo}>{i.codigo} · {tx(i.texto, locale)}</li>)}</ul>
          </>
        )}
        <h3 className="font-semibold">{t('documentosPendientes', { n: faltantes.length })}</h3>
        <ul className="list-disc space-y-1 pl-5 text-medio-texto">{faltantes.map((d) => <li key={d.codigo}>{d.codigo} · {tx(documentoPorCodigo(d.codigo)!.nombre, locale)}</li>)}</ul>
      </Capitulo>

      <p className="text-xs text-medio-texto print:mt-6">{t('pie')}</p>
    </article>
  )
}
