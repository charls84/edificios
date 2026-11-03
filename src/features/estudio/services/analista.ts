import 'server-only'
import { generateObject } from 'ai'
import { resumirVisita } from '@/features/visita/lib/calificacion'
import { createClient } from '@/lib/supabase/server'
import { IA_DISPONIBLE, MODELO_ANALISTA, openrouter } from '@/shared/lib/ai'
import { CAMPOS_FUENTES } from '../catalogo/fuentes'
import { ITEMS_GUIA } from '../catalogo/guia'
import { esquemaAnalisisIA, INSTRUCCIONES_ANALISTA, puntajeGlobal, type AnalisisIAGuardado } from '../lib/analista-ia'
import { calcularFiltros } from '../lib/filtros'
import type { ResultadoMayorMejorUso } from '../types'
import { getConsultaAuto, getDocumentos, getEdificio, getFiltros, getFuentes, getInformeVisita, getItemsGuia, getUltimoAnalisis, getUsos } from './consultas'
import { getDecision } from './decision'

// El analista de IA lee el expediente completo del predio y devuelve puntajes por dimensión
// y una sugerencia. No recibe datos personales: ni nombres ni cédulas de propietarios,
// ni el contacto de la ficha (Ley 1581).

type Supabase = Awaited<ReturnType<typeof createClient>>

async function lecturasDocumentos(supabase: Supabase, buildingId: string) {
  const { data } = await supabase.from('data_points').select('clave, valor').eq('building_id', buildingId).eq('categoria', 'auto').in('clave', ['certificado', 'catastral'])
  const por = Object.fromEntries(((data ?? []) as { clave: string; valor: unknown }[]).map((d) => [d.clave, d.valor]))
  return { certificado: por.certificado ?? null, catastral: por.catastral ?? null }
}

export async function armarExpediente(buildingId: string) {
  const supabase = await createClient()
  const [edificio, docs, items, usos, informe, mmu, filtros, fuentes, consulta, lecturas, decision] = await Promise.all([
    getEdificio(buildingId), getDocumentos(buildingId), getItemsGuia(buildingId), getUsos(buildingId), getInformeVisita(buildingId),
    getUltimoAnalisis<ResultadoMayorMejorUso>(buildingId, 'mayor_mejor_uso'), getFiltros(buildingId), getFuentes(buildingId),
    getConsultaAuto(buildingId), lecturasDocumentos(supabase, buildingId), getDecision(buildingId),
  ])
  if (!edificio) return null
  const textoItem = new Map(ITEMS_GUIA.map((i) => [i.codigo, i.texto.es]))
  const textoFuente = new Map(CAMPOS_FUENTES.map((c) => [c.clave, c.texto.es]))
  const visita = resumirVisita(informe)
  const sinAnillo = consulta?.lote ? { ...consulta, lote: { ...consulta.lote, anillo: undefined } } : consulta
  return {
    predio: { nombre: edificio.nombre, direccion: edificio.direccion, chip: edificio.chip, zona: edificio.zona, etapa: edificio.etapa },
    documentosBase: docs.filter((d) => ['F01', 'F03'].includes(d.codigo)).map((d) => ({ codigo: d.codigo, estado: d.estado })),
    consultaAutomatica: sinAnillo,
    certificadoTradicion: lecturas.certificado,
    certificadoCatastral: lecturas.catastral,
    fuentes: Object.fromEntries(Object.entries(fuentes).map(([k, v]) => [textoFuente.get(k) ?? k, v.texto])),
    filtros: { evaluaciones: filtros.map((f) => ({ criterio: f.codigo, puntaje: f.puntaje, nota: f.nota })), resultado: calcularFiltros(filtros) },
    checklist: items.filter((i) => i.estado !== 'pendiente').map((i) => ({ item: `${i.codigo} ${textoItem.get(i.codigo) ?? ''}`, estado: i.estado, nota: i.nota })),
    visita: visita && informe ? {
      promedio: visita.promedio,
      calificaciones: visita.porClave,
      conclusion: informe.resumenTitulo,
      hallazgos: informe.hallazgos,
      secciones: informe.secciones.map((s) => ({ seccion: s.etiqueta, puntaje: s.puntaje ?? null, titular: s.titulo, descripcion: s.texto, notas: s.notas })),
    } : null,
    usosCandidatos: usos.map((u) => ({ nombre: u.nombre, categoria: u.categoria, legal: u.legal, fisico: u.fisico, demanda: u.demanda, m2Netos: u.m2Netos, canonM2: u.canonM2, inversion: u.inversion, riesgo: u.riesgo })),
    analisisFinanciero: mmu?.resultado ?? null,
    sugerenciaPorReglas: { decision: decision.decision, razones: decision.razones.map((r) => r.es), condiciones: decision.condiciones.map((r) => r.es), faltantes: decision.faltantes.map((r) => r.es), alertas: decision.alertas.map((r) => r.es) },
  }
}

export type ResultadoAnalista = { ok: true; analisis: AnalisisIAGuardado } | { ok: false; error: 'sinLlave' | 'sinPredio' | 'fallo' }

export async function correrAnalista(buildingId: string): Promise<ResultadoAnalista> {
  if (!IA_DISPONIBLE) return { ok: false, error: 'sinLlave' }
  const expediente = await armarExpediente(buildingId)
  if (!expediente) return { ok: false, error: 'sinPredio' }
  try {
    const { object } = await generateObject({
      model: openrouter(MODELO_ANALISTA),
      schema: esquemaAnalisisIA,
      system: INSTRUCCIONES_ANALISTA,
      prompt: `Expediente del predio:\n${JSON.stringify(expediente)}`,
      temperature: 0.2,
      maxOutputTokens: 4000,
      abortSignal: AbortSignal.timeout(90_000),
    })
    const analisis: AnalisisIAGuardado = { fecha: new Date().toISOString(), modelo: MODELO_ANALISTA, puntajeGlobal: puntajeGlobal(object), resultado: object }
    const supabase = await createClient()
    await supabase.from('data_points').upsert(
      { building_id: buildingId, categoria: 'ia', clave: 'analista', valor: analisis, estado: 'automatico', fecha_consulta: analisis.fecha },
      { onConflict: 'building_id,categoria,clave' }
    )
    return { ok: true, analisis }
  } catch (e) {
    // Solo el mensaje del error (sin el expediente ni la llave), para revisarlo en los logs de Vercel
    console.error('[analista-ia]', MODELO_ANALISTA, e instanceof Error ? e.message : 'error desconocido')
    return { ok: false, error: 'fallo' }
  }
}

export async function getAnalisisIA(buildingId: string): Promise<AnalisisIAGuardado | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('data_points').select('valor').eq('building_id', buildingId).eq('categoria', 'ia').eq('clave', 'analista').maybeSingle()
  return ((data as { valor: AnalisisIAGuardado } | null)?.valor) ?? null
}
