import { getLocale, getTranslations } from 'next-intl/server'
import { SemaforoBadge } from '@/features/ficha/components/badges'
import type { InformeVisita } from '@/features/ficha/types'
import { DOCUMENTOS, documentoPorCodigo } from '../catalogo/documentos'
import { ITEMS_GUIA, itemsDelBloque } from '../catalogo/guia'
import { COP, fecha, numero, porcentaje, tx } from '../lib/texto'
import type { AnalisisGuardado, EdificioReal, EstadoDocumentoEdificio, EstadoItemEdificio, ResultadoMayorMejorUso, ResultadoTamizaje, UsoCandidato } from '../types'
import { FILTROS } from '../catalogo/filtros'
import { FUENTES } from '../catalogo/fuentes'
import { CalificacionVisita } from '@/features/visita/components/calificacion-visita'
import { resumirVisita } from '@/features/visita/lib/calificacion'
import type { SugerenciaDecision } from '../lib/decision'
import { urlArchivo } from '../lib/archivos'
import type { AnalisisIAGuardado } from '../lib/analista-ia'
import type { ConsultaPredio } from '../types'
import { BotonImprimir } from './boton-imprimir'
import { IndicadoresClave, PortadaInforme, RegistroFotografico, type DatoClave, type FotoReporte } from './informe-portada'
import { DecisionSugerida } from './decision-sugerida'
import { RadarFiltros } from './radar-filtros'

const TITULOS_FILTROS = Object.fromEntries(FILTROS.map((f) => [f.codigo, f.titulo]))
import { ResultadoMayorMejorUso as VistaMmu } from './resultado-mmu'

interface Props {
  edificio: EdificioReal
  docs: EstadoDocumentoEdificio[]
  items: EstadoItemEdificio[]
  usos: UsoCandidato[]
  informe: InformeVisita | null
  tamizaje: AnalisisGuardado<ResultadoTamizaje> | null
  mmu: AnalisisGuardado<ResultadoMayorMejorUso> | null
  fuentes: Record<string, { texto: string; fecha: string }>
  decision: SugerenciaDecision
  ia: React.ReactNode
  iaDatos?: AnalisisIAGuardado | null
  consulta?: ConsultaPredio | null
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
    <section className="informe-cap bento print:rounded-none print:border-0 print:p-0 print:shadow-none" aria-labelledby={`cap-${n}`}>
      <h2 id={`cap-${n}`} className="informe-titulo text-lg font-bold print:border-b-2 print:border-torna print:pb-1.5 print:text-[13pt]"><span className="mr-2 text-rojo">{String(n).padStart(2, '0')}</span>{titulo}</h2>
      <div className="mt-3 space-y-3 text-sm print:text-[9.5pt]">{children}</div>
    </section>
  )
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Quita el prefijo "Automático · IA ·" y descarta la nota si solo repite el texto del ítem */
function notaUtil(nota: string | null, item: string): string | null {
  if (!nota) return null
  const limpia = nota.replace(/^Automático · (IA · )?/, '')
  const cuerpo = sinTildes(limpia).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  const base = sinTildes(item).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cuerpo || cuerpo.startsWith(base.slice(0, Math.min(base.length, 40)))) return null
  return nota.startsWith('Automático') ? nota : limpia
}

async function Bloque({ codigo, estados }: { codigo: string; estados: Map<string, EstadoItemEdificio> }) {
  const [t, locale] = await Promise.all([getTranslations('estudio.checklist.estados'), getLocale()])
  return (
    <ul className="divide-y divide-borde">
      {itemsDelBloque(codigo).map((item) => {
        const e = estados.get(item.codigo)
        const nota = notaUtil(e?.nota ?? null, tx(item.texto, locale))
        return (
          <li key={item.codigo} className="informe-fila flex items-start justify-between gap-3 py-1.5 print:py-1">
            <span>
              <span className="mr-1.5 font-mono text-xs text-medio-texto">{item.codigo}</span>{tx(item.texto, locale)}
              {nota && <span className="block text-xs text-medio-texto">{nota}</span>}
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${ESTADO_COLOR[e?.estado ?? 'pendiente']}`}>{t(e?.estado ?? 'pendiente')}</span>
          </li>
        )
      })}
    </ul>
  )
}

// Informe de viabilidad: los 10 capitulos de la guia (seccion 07), armados con lo que hay en la ficha
export async function Informe({ edificio, docs, items, usos, informe, tamizaje, mmu, fuentes, decision, ia, iaDatos = null, consulta = null }: Props) {
  const [t, tf, locale] = await Promise.all([getTranslations('estudio.informe'), getTranslations('estudio.filtros'), getLocale()])
  const estados = new Map(items.map((i) => [i.codigo, i]))
  const estadoDoc = new Map(docs.map((d) => [d.codigo, d]))
  const r = mmu?.resultado ?? null
  const recomendado = r ? r.usos.find((u) => u.id === r.recomendado) ?? null : null
  const cargados = DOCUMENTOS.filter((d) => ['cargado', 'validado'].includes(estadoDoc.get(d.codigo)?.estado ?? ''))
  // Solo cuentan como pendientes los documentos que hay que cargar (hoy, el certificado de tradición)
  const faltantes = DOCUMENTOS.filter((d) => d.minimo && !['cargado', 'validado'].includes(estadoDoc.get(d.codigo)?.estado ?? ''))
  const porVerificar = ITEMS_GUIA.filter((i) => estados.get(i.codigo)?.estado === 'por_verificar')
  const fragiles = r ? r.usos.filter((u) => u.viable && u.sensibilidad.canonMenos10 != null && u.sensibilidad.canonMenos10 < r.parametros.tasaMinima) : []
  const hoy = fecha(locale, new Date().toISOString())
  // Usos con números puestos por la plataforma: el informe lo advierte hasta que el comercial los cambie
  const conSupuestos = usos.some((u) => u.demandaNota?.includes('supuestos de referencia'))
  const visita = resumirVisita(informe)
  const tp = await getTranslations('estudio.informe.portada')
  const td = await getTranslations('estudio.decision')
  const ta = await getTranslations('estudio.analista')
  const rf = tamizaje?.resultado.filtros ?? null
  const a = iaDatos?.resultado ?? null
  const m2 = (n: number) => `${numero(locale, n, 0)} m²`

  // Fotos: primero las de la visita (con su sección), luego las imágenes cargadas en Documentos
  const fotosVisita: (FotoReporte & { general: boolean })[] = (informe?.secciones ?? []).flatMap((sec) => sec.fotos.filter((f) => !f.src.startsWith('idb:')).map((f) => ({ src: f.src, titulo: f.destacado || sec.etiqueta, detalle: f.destacado ? sec.etiqueta : f.texto || undefined, general: sec.clave === 'general' })))
  // Pie corto para las fotos de Documentos: el nombre del documento hasta la primera coma
  const fotosDocs: FotoReporte[] = docs.flatMap((d) => d.archivos.filter((x) => /\.(jpe?g|png|webp)$/i.test(x.nombreArchivo)).map((x) => ({ src: urlArchivo('documentos', x.ruta), titulo: tx(documentoPorCodigo(d.codigo)?.nombre ?? { es: d.codigo, en: d.codigo }, locale).split(/[,:(]/)[0].trim() })))
  const principal: FotoReporte[] = edificio.foto ? [{ src: edificio.foto, titulo: tp('fotoPrincipal') }] : []
  const fotos: FotoReporte[] = [...principal, ...fotosVisita, ...fotosDocs].filter((f, i, arr) => arr.findIndex((g) => g.src === f.src) === i)
  // Portada: la vista general del edificio en la visita; si no hay, la primera foto cargada en Documentos
  const fotoPortada = principal[0] ?? fotosVisita.find((f) => f.general) ?? fotosDocs[0] ?? fotos[0] ?? null

  const c = consulta
  const datosPortada: DatoClave[] = [
    { etiqueta: 'CHIP', valor: edificio.chip ?? '—' },
    { etiqueta: tp('matricula'), valor: edificio.matricula ?? '—' },
    { etiqueta: tp('lote'), valor: c?.lote ? m2(c.lote.areaM2) : '—' },
    { etiqueta: tp('construida'), valor: c?.construccion?.areaConstruidaM2 ? `${m2(c.construccion.areaConstruidaM2)} (${tp('estimada')})` : '—' },
    { etiqueta: tp('pisos'), valor: c?.construccion ? `${c.construccion.pisos}${c.construccion.sotanos ? ` + ${c.construccion.sotanos} ${tp('sotano')}` : ''}` : '—' },
    { etiqueta: tp('patrimonio'), valor: c?.bic?.nivel ?? (c?.pemp ? 'PEMP' : c ? tp('noBic') : '—') },
    { etiqueta: tp('tratamiento'), valor: c?.pot?.tratamiento ? c.pot.tratamiento.charAt(0) + c.pot.tratamiento.slice(1).toLowerCase() : '—' },
    { etiqueta: tp('estrato'), valor: c?.manzana?.estrato != null ? String(c.manzana.estrato) : '—' },
    { etiqueta: tp('corte'), valor: hoy },
  ]
  const conclusion = a
    ? { decision: td(`opcion.${a.decision}`), puntaje: iaDatos!.puntajeGlobal != null ? `${iaDatos!.puntajeGlobal}/100` : '—', detalle: a.usoRecomendado ? tp('usoIa', { uso: a.usoRecomendado }) : ta('titulo') }
    : { decision: td(`opcion.${decision.decision}`), puntaje: rf?.potencial != null ? `${rf.potencial}/100` : '—', detalle: tp('porReglas') }

  const indicadores = [
    { etiqueta: tp('decision'), valor: conclusion.decision, tono: (a?.decision ?? decision.decision) === 'descartar' ? 'rojo' as const : (a?.decision ?? decision.decision) === 'continuar' ? 'verde' as const : 'ambar' as const },
    { etiqueta: tp('puntajeIa'), valor: iaDatos?.puntajeGlobal != null ? `${iaDatos.puntajeGlobal}/100` : '—' },
    { etiqueta: tp('potencial'), valor: rf?.potencial != null ? `${rf.potencial}/100` : '—' },
    { etiqueta: tp('usoRecomendado'), valor: recomendado?.nombre ?? '—' },
    { etiqueta: tp('rentabilidad'), valor: recomendado?.rentabilidad != null ? porcentaje(locale, recomendado.rentabilidad) : '—' },
    { etiqueta: 'VPN', valor: recomendado?.vpn != null ? `$ ${numero(locale, recomendado.vpn / 1_000_000, 1)} ${tp('millones')}` : '—' },
  ]

  // Riesgos: los del analista por dimensión, las alertas y bloqueos por reglas
  const riesgosIa = a ? Object.entries(a.dimensiones).flatMap(([d, x]) => x.riesgos.map((rz) => `${ta(`dimension.${d}`)}: ${rz}`)) : []
  const pendientesPorBloque = ['A', 'B', 'C', 'CV', 'D', 'E', 'F']
    .map((b) => ({ b, items: porVerificar.filter((i) => i.bloque === b) }))
    .filter((g) => g.items.length > 0)

  return (
    <article className="informe space-y-4 print:space-y-5">
      <PortadaInforme edificio={edificio} foto={fotoPortada} datos={datosPortada} conclusion={conclusion} fecha={hoy} />

      <header className="bento flex flex-wrap items-start justify-between gap-4 bg-torna text-white print:hidden">
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
        <IndicadoresClave datos={indicadores} />
        {ia}
        <DecisionSugerida sugerencia={decision} className="border-0 p-0 shadow-none" />
        {recomendado ? (
          <>
            <p className="text-lg font-semibold">{t('usoRecomendado', { uso: recomendado.nombre })}</p>
            <p>{t('porque', { rentabilidad: porcentaje(locale, recomendado.rentabilidad ?? 0), vpn: COP(locale, recomendado.vpn ?? 0), recuperacion: numero(locale, recomendado.recuperacionAnios ?? 0) })}</p>
            {(recomendado.provisional || conSupuestos) && (
              <p className="rounded-xl bg-ambar-claro px-3 py-2 text-sm text-ambar">
                {[recomendado.provisional && t('avisoProvisional'), conSupuestos && t('avisoSupuestos')].filter(Boolean).join(' ')}
              </p>
            )}
          </>
        ) : <p className="text-medio-texto">{t('sinRecomendacion')}</p>}
        {tamizaje?.resultado.filtros && (
          <div className="grid grid-cols-1 items-center gap-4 rounded-xl bg-fondo p-4 sm:grid-cols-[220px_1fr] print:bg-white">
            <RadarFiltros filtros={tamizaje.resultado.filtros.filtros} titulos={TITULOS_FILTROS} locale={locale} tamano={220} descripcion={tf('radar', { potencial: tamizaje.resultado.filtros.potencial ?? 0 })} />
            <div>
              <p className="font-semibold">{tf('titulo')}</p>
              <p className="text-3xl font-bold tabular-nums">{tamizaje.resultado.filtros.potencial ?? '—'}<span className="text-base text-medio-texto">/100</span></p>
              <p>{tf(`lectura.${tamizaje.resultado.filtros.lectura}`)}</p>
            </div>
          </div>
        )}
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
        {fotos.length > 0 && (
          <>
            <h3 className="informe-titulo pt-2 font-semibold">{tp('registro', { n: fotos.length })}</h3>
            <RegistroFotografico fotos={fotos.slice(0, 9)} />
          </>
        )}
      </Capitulo>

      <Capitulo n={3} titulo={t('cap.3')}>
        <h3 className="font-semibold">{t('consultasEnLinea')}</h3>
        <dl className="divide-y divide-borde">
          {FUENTES.flatMap((f) => f.campos.map((c) => {
            const v = fuentes[`${f.codigo}.${c.codigo}`]
            return (
              <div key={`${f.codigo}.${c.codigo}`} className="grid grid-cols-1 gap-1 py-1.5 sm:grid-cols-[1fr_2fr]">
                <dt className="text-medio-texto">{tx(f.nombre, locale).split(' · ')[0]} · {tx(c.texto, locale)}</dt>
                <dd className={v ? '' : 'text-medio-texto'}>{v ? v.texto : t('sinConsultar')}</dd>
              </div>
            )
          }))}
        </dl>
        <Bloque codigo="B" estados={estados} />
      </Capitulo>

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
        {visita && visita.calificadas > 0 && (
          <>
            <CalificacionVisita resumen={visita} />
            <dl className="divide-y divide-borde">
              {informe!.secciones.filter((s) => s.clave && (s.titulo || s.notas)).map((s) => (
                <div key={s.clave} className="grid grid-cols-1 gap-1 py-1.5 sm:grid-cols-[1fr_2fr]">
                  <dt className="text-medio-texto">{s.etiqueta}{s.puntaje != null ? ` · ${s.puntaje}/10` : ''}</dt>
                  <dd>{[s.titulo, s.notas].filter(Boolean).join('. ')}</dd>
                </div>
              ))}
            </dl>
          </>
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
        {(() => {
          const bloqueos = (tamizaje?.resultado.bloqueos ?? []).map((cod) => { const it = ITEMS_GUIA.find((x) => x.codigo === cod); return `${cod} · ${it ? tx(it.texto, locale) : ''}` })
          const reglas = [
            ...decision.alertas.map((x) => tx(x, locale)),
            ...usos.filter((u) => u.riesgo === 'alto').map((u) => t('riesgoAlto', { uso: u.nombre })),
            ...fragiles.map((u) => t('fragil', { uso: u.nombre })),
            ...(r?.loteVacioManda ? [t('loteVacio')] : []),
          ]
          const condiciones = decision.condiciones.map((x) => tx(x, locale))
          if (!bloqueos.length && !reglas.length && !riesgosIa.length && !condiciones.length) return <p className="text-medio-texto">{t('sinRiesgos')}</p>
          return (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
              {(bloqueos.length > 0 || reglas.length > 0 || riesgosIa.length > 0) && (
                <div className="informe-fila rounded-lg border-l-4 border-rojo bg-rojo-claro/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rojo-oscuro">{tp('riesgos')}</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5">{[...bloqueos, ...reglas, ...riesgosIa].map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
              {condiciones.length > 0 && (
                <div className="informe-fila rounded-lg border-l-4 border-ambar bg-ambar-claro/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ambar">{tp('mitigacion')}</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5">{condiciones.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
            </div>
          )
        })()}
      </Capitulo>

      <Capitulo n={10} titulo={t('cap.10')}>
        {a && a.proximosPasos.length > 0 && (
          <div className="informe-fila">
            <h3 className="font-semibold">{tp('pasos')}</h3>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5">{a.proximosPasos.map((x, i) => <li key={i}>{x}</li>)}</ol>
          </div>
        )}
        {porVerificar.length > 0 && (
          <>
            <h3 className="informe-titulo font-semibold">{t('porVerificar', { n: porVerificar.length })}</h3>
            <div className="columns-1 gap-6 text-xs md:columns-2 print:columns-2">
              {pendientesPorBloque.map((g) => (
                <div key={g.b} className="informe-fila mb-2 break-inside-avoid">
                  <p className="font-semibold text-torna">{tp('bloque', { b: g.b })}</p>
                  <ul className="mt-0.5 space-y-0.5">{g.items.map((i) => <li key={i.codigo}><span className="mr-1 font-mono text-medio-texto">{i.codigo}</span>{tx(i.texto, locale)}</li>)}</ul>
                </div>
              ))}
            </div>
          </>
        )}
        <h3 className="font-semibold">{t('documentosPendientes', { n: faltantes.length })}</h3>
        {faltantes.length > 0 && <ul className="list-disc space-y-1 pl-5 text-medio-texto">{faltantes.map((d) => <li key={d.codigo}>{d.codigo} · {tx(documentoPorCodigo(d.codigo)!.nombre, locale)}</li>)}</ul>}
      </Capitulo>

      {fotos.length > 9 && (
        <section className="informe-cap bento print:rounded-none print:border-0 print:p-0 print:shadow-none" aria-labelledby="anexo-fotos">
          <h2 id="anexo-fotos" className="informe-titulo text-lg font-bold print:border-b-2 print:border-torna print:pb-1.5 print:text-[13pt]">{tp('anexo')}</h2>
          <div className="mt-3"><RegistroFotografico fotos={fotos.slice(9, 30)} /></div>
        </section>
      )}

      <p className="text-xs text-medio-texto print:mt-6">{t('pie')}</p>
    </article>
  )
}
