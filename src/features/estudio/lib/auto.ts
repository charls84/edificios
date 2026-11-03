import type { ConsultaPredio, EstadoItem } from '../types'
import type { Puntaje } from './filtros'

// Traduce la consulta automática (Catastro, DADEP, Jardín Botánico) a lo que el equipo
// llenaba a mano: textos de la pestaña Fuentes, puntajes sugeridos de los 5 filtros e
// ítems de la checklist A–F. Solo sugiere: lo que el equipo ya escribió manda.

export interface SugerenciaFiltro { codigo: string; puntaje: Puntaje | null; nota: string }
export interface SugerenciaItem { codigo: string; estado: EstadoItem; nota: string }

export interface Sugerencias {
  fuentes: Record<string, string>
  filtros: SugerenciaFiltro[]
  checklist: SugerenciaItem[]
}

/** Prefijo de las notas que escribe la plataforma (así se distinguen de las del equipo) */
export const PREFIJO_AUTO = 'Automático · '

const m = (n: number) => `${Math.round(n).toLocaleString('es-CO')} m`
const ok = (c: ConsultaPredio, fuente: string) => c.estado[fuente]?.estado !== 'error'

function textosFuentes(c: ConsultaPredio): Record<string, string> {
  const f: Record<string, string> = {}
  const l = c.lote
  if (c.upl) f['sinupot.upl'] = [`UPL ${c.upl}`, c.manzana?.uso && `uso predominante de la manzana: ${c.manzana.uso.toLowerCase()}`].filter(Boolean).join(' · ')
  if (ok(c, 'licencias')) {
    f['sinupot.licencias'] = c.licencias.length
      ? c.licencias.map((x) => `${x.acto} (${x.fecha ?? 'sin fecha'}) · ${x.tipo.toLowerCase()} · ${x.decision.toLowerCase()}`).join('; ')
      : 'Catastro no registra licencias sobre el lote'
  }
  if (c.plusvalia != null) f['sinupot.plusvalia'] = c.plusvalia ? 'Registra zona de plusvalía (Catastro)' : 'Sin plusvalía registrada (Catastro)'
  if (ok(c, 'amenaza')) {
    f['sinupot.riesgo'] = [c.amenazaRemocion ? `Amenaza por remoción en masa: ${c.amenazaRemocion}` : 'Fuera de zonas de amenaza por remoción en masa', c.arqueologia && `zona de protección arqueológica (${c.arqueologia})`]
      .filter(Boolean).join(' · ')
  }
  if (ok(c, 'patrimonio')) {
    f['bic.es_bic'] = c.bic ? `Sí · ámbito ${c.bic.ambito?.toLowerCase() ?? 'por confirmar'}${c.bic.acto ? ` · ${c.bic.acto}` : ''}` : 'No figura como BIC en Catastro'
    if (c.bic?.nivel) f['bic.nivel'] = c.bic.nivel
    const sector = [c.sectorInteresCultural, c.pemp === 'afectada' ? 'área afectada del PEMP' : c.pemp === 'influencia' ? 'zona de influencia del PEMP' : null].filter(Boolean)
    f['bic.sector'] = sector.length ? sector.join(' · ') : 'Fuera de sectores de interés cultural y de PEMP'
  }
  const ep = c.espacioPublico
  if (ok(c, 'espacio_publico')) {
    f['espacio_publico.colindancia'] = [
      ep.alameda && (/^alameda/i.test(ep.alameda) ? ep.alameda : `Alameda ${ep.alameda}`),
      ep.andenMaxM && `andén de hasta ${ep.andenMaxM.toLocaleString('es-CO')} m`,
      ep.vias && `${ep.vias} ${ep.vias === 1 ? 'frente a vía' : 'frentes a vía'}`,
      ep.prediosPublicos && `${ep.prediosPublicos} predio(s) del DADEP a menos de 15 m`,
    ].filter(Boolean).join(' · ') || 'Sin espacio público registrado junto al lote'
  }
  if (ok(c, 'reserva_vial')) {
    f['espacio_publico.afectacion'] = c.reservaVial
      ? `Reserva vial (${c.reservaVial.nombre}): ${c.reservaVial.areaM2.toLocaleString('es-CO')} m² del lote${l ? ` de ${l.areaM2.toLocaleString('es-CO')} m²` : ''}`
      : 'Sin reserva vial sobre el lote'
  }
  const a = c.arboles
  if (ok(c, 'arbolado')) {
    const cercano = a.masCercano && `el más cercano: ${a.masCercano.especie.toLowerCase()} a ${a.masCercano.distancia.toLocaleString('es-CO')} m`
    f['arbolado.arboles'] = !a.masCercano ? 'Sin árboles registrados a menos de 30 m'
      : a.a10m ? `${a.a10m} árbol(es) a menos de 10 m · ${cercano}` : `Ninguno a menos de 10 m · ${cercano}`
    const protegido = a.protegidos[0]
    f['arbolado.permiso'] = protegido && protegido.distancia <= 10
      ? `Sí: especie protegida a ${protegido.distancia.toLocaleString('es-CO')} m (${protegido.especie.toLowerCase()})`
      : protegido ? `No, si la obra no sale del lote. Hay una especie protegida a ${protegido.distancia.toLocaleString('es-CO')} m (${protegido.especie.toLowerCase()})`
      : a.a10m ? 'Solo si la obra interviene un árbol: permiso de la Secretaría de Ambiente' : 'No, sin árboles junto al lote'
  }
  return f
}

function filtros(c: ConsultaPredio): SugerenciaFiltro[] {
  const s: SugerenciaFiltro[] = []
  const l = c.lote
  if (l && ok(c, 'reserva_vial')) {
    const parte = c.reservaVial ? c.reservaVial.areaM2 / l.areaM2 : 0
    const pct = parte < 0.01 ? 'menos del 1' : String(Math.round(parte * 100))
    s.push({ codigo: 'U1', puntaje: parte >= 0.9 ? 0 : 2, nota: c.reservaVial ? `Reserva vial de ${c.reservaVial.areaM2.toLocaleString('es-CO')} m² (${pct} % del lote)` : 'Sin reserva vial sobre el lote' })
  }
  const t = c.transporte
  if (ok(c, 'transporte')) {
    const d = Math.min(t.distanciaEstacion ?? Infinity, t.distanciaMetro ?? Infinity)
    s.push({
      codigo: 'U2', puntaje: d <= 500 ? 2 : d <= 1000 ? 1 : 0,
      nota: Number.isFinite(d) ? `${t.estacion ? `Estación ${t.estacion} a ${m(t.distanciaEstacion!)}` : ''}${t.troncalCercana ? ` · troncal ${t.troncalCercana}` : ''}`.replace(/^ · /, '') : 'Sin estación de TransMilenio a menos de 1,5 km',
    })
  }
  if (ok(c, 'universidades')) {
    const n = c.universidades.length
    s.push({ codigo: 'U3', puntaje: n >= 2 ? 2 : n === 1 ? 1 : 0, nota: n ? `${n} sede(s) de educación superior a menos de 1 km; la más cercana a ${m(c.universidades[0].distancia)}` : 'Sin universidades a menos de 1 km' })
  }
  if (ok(c, 'amenaza') && c.amenazaRemocion !== 'alta') {
    s.push({ codigo: 'N1', puntaje: 2, nota: c.amenazaRemocion ? `Amenaza ${c.amenazaRemocion} por remoción en masa` : 'Fuera de zonas de amenaza por remoción' })
  }
  if (ok(c, 'renobo') && c.renobo) s.push({ codigo: 'N4', puntaje: 1, nota: `Dentro de un ámbito de RenoBo: ${c.renobo}` })
  if (ok(c, 'patrimonio')) {
    const nivel = c.bic?.nivel ?? ''
    if (/1/.test(nivel)) s.push({ codigo: 'R3', puntaje: 0, nota: `BIC ${nivel}: intervención muy limitada` })
    else if (c.bic || c.pemp || c.sectorInteresCultural) s.push({ codigo: 'R3', puntaje: 1, nota: c.bic ? `BIC ${nivel || 'sin nivel registrado'}` : 'Dentro de un sector o PEMP patrimonial' })
    else s.push({ codigo: 'R3', puntaje: 2, nota: 'No es BIC ni está en sector patrimonial' })
    if (c.bic || c.renobo) s.push({ codigo: 'R4', puntaje: 1, nota: 'Posible incentivo de reúso (Reúsa y Revitaliza o exención predial por BIC): confirmar con RenoBo' })
  }
  return s.map((x) => ({ ...x, nota: PREFIJO_AUTO + x.nota }))
}

function checklist(c: ConsultaPredio, f: Record<string, string>): SugerenciaItem[] {
  const s: SugerenciaItem[] = []
  if (f['sinupot.licencias']) s.push({ codigo: 'A4', estado: 'por_verificar', nota: `${f['sinupot.licencias']}. Faltan planos aprobados y permiso de ocupación.` })
  if (f['sinupot.plusvalia']) s.push({ codigo: 'A5', estado: 'por_verificar', nota: `${f['sinupot.plusvalia']}. Falta el paz y salvo predial.` })
  if (f['espacio_publico.afectacion']) s.push({ codigo: 'A6', estado: 'por_verificar', nota: `${f['espacio_publico.afectacion']}. Confirmar servidumbres en el certificado de tradición.` })
  if (c.upl) s.push({ codigo: 'B1', estado: 'cumple', nota: `POT Decreto 555 de 2021 · UPL ${c.upl}` })
  if (f['bic.es_bic']) s.push({ codigo: 'B5', estado: 'cumple', nota: [f['bic.es_bic'], f['bic.nivel'], f['bic.sector']].filter(Boolean).join(' · ') })
  if (c.renobo || c.bic) s.push({ codigo: 'B8', estado: 'por_verificar', nota: 'Puede aplicar a incentivos de reúso: confirmar con RenoBo y Hacienda.' })
  if (c.lote) {
    const cons = c.construccion ? ` · ${c.construccion.pisos} pisos${c.construccion.sotanos ? ` y ${c.construccion.sotanos} sótano(s)` : ''}` : ''
    s.push({ codigo: 'C13', estado: 'por_verificar', nota: `Lote de ${c.lote.areaM2.toLocaleString('es-CO')} m²${cons}${c.espacioPublico.vias ? ` · ${c.espacioPublico.vias} frente(s) a vía` : ''}. Revisar acceso de carga en la visita.` })
  }
  return s.map((x) => ({ ...x, nota: PREFIJO_AUTO + x.nota }))
}

export function sugerenciasDeConsulta(c: ConsultaPredio): Sugerencias {
  const fuentes = textosFuentes(c)
  return { fuentes, filtros: filtros(c), checklist: checklist(c, fuentes) }
}
