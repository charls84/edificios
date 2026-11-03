import 'server-only'
import { generateText } from 'ai'
import { resumirVisita } from '@/features/visita/lib/calificacion'
import { createClient } from '@/lib/supabase/server'
import { IA_DISPONIBLE, modelosAnalista, openrouter } from '@/shared/lib/ai'
import { CRITERIOS_FILTROS } from '../catalogo/filtros'
import { CAMPOS_FUENTES } from '../catalogo/fuentes'
import { ITEMS_GUIA } from '../catalogo/guia'
import { PREFIJO_AUTO } from '../lib/auto'
import { FORMATO_RESPUESTA, INSTRUCCIONES_ANALISTA, leerRespuestaIA, puntajeGlobal, type AnalisisIA, type AnalisisIAGuardado } from '../lib/analista-ia'
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
  const puntuados = new Set(filtros.filter((f) => f.puntaje != null).map((f) => f.codigo))
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
    criteriosPendientes: CRITERIOS_FILTROS.filter((c) => !puntuados.has(c.codigo)).map((c) => ({
      codigo: c.codigo, filtro: c.filtro, criterio: c.texto.es, veto: Boolean(c.veto), niveles: c.niveles.map((n, i) => `${i}: ${n.es}`),
    })),
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

/**
 * Lo que el analista propone se escribe solo donde no hay nada: criterios de los 5 filtros
 * sin puntaje (quedan como "Automático · IA") y usos candidatos si el edificio no tiene.
 * Las fuentes y las reglas mandan sobre la IA, y el equipo manda sobre todo.
 */
async function completarHuecos(supabase: Supabase, buildingId: string, a: AnalisisIA, areaConstruida: number | null) {
  const { data } = await supabase.from('data_points').select('clave').eq('building_id', buildingId).eq('categoria', 'filtros')
  const existentes = new Set(((data ?? []) as { clave: string }[]).map((d) => d.clave))
  const validos = new Set(CRITERIOS_FILTROS.map((c) => c.codigo))
  const filas = (a.criterios ?? [])
    .filter((c) => validos.has(c.codigo) && !existentes.has(c.codigo))
    .map((c) => ({ building_id: buildingId, categoria: 'filtros', clave: c.codigo, valor: { puntaje: c.puntaje, nota: `${PREFIJO_AUTO}IA · ${c.nota}` }, estado: 'automatico', fecha_consulta: new Date().toISOString() }))
  if (filas.length) await supabase.from('data_points').upsert(filas, { onConflict: 'building_id,categoria,clave', ignoreDuplicates: true })

  const { count } = await supabase.from('candidate_uses').select('id', { count: 'exact', head: true }).eq('building_id', buildingId)
  if (!count && a.usos?.length) {
    // Área útil aproximada: 80 % del área construida estimada, repartida entre los usos propuestos
    const m2 = areaConstruida ? Math.round((areaConstruida * 0.8) / a.usos.length) : null
    await supabase.from('candidate_uses').insert(a.usos.map((u, i) => ({
      building_id: buildingId, nombre: u.nombre, categoria: u.categoria, orden: i,
      legal: u.legal, legal_nota: `IA · ${u.nota}`, fisico: u.fisico, demanda: u.demanda, m2_netos: m2,
    })))
  }
}

export type ResultadoAnalista = { ok: true; analisis: AnalisisIAGuardado } | { ok: false; error: 'sinLlave' | 'sinPredio' | 'fallo' }

export async function correrAnalista(buildingId: string): Promise<ResultadoAnalista> {
  if (!IA_DISPONIBLE) return { ok: false, error: 'sinLlave' }
  const expediente = await armarExpediente(buildingId)
  if (!expediente) return { ok: false, error: 'sinPredio' }
  const modelos = await modelosAnalista()
  if (modelos.length === 0) console.error('[analista-ia] no se pudo obtener la lista de modelos gratuitos de OpenRouter')
  // Se prueba un modelo tras otro: los gratuitos a veces están saturados o devuelven JSON inválido
  for (const modelo of modelos) {
    try {
      const { text } = await generateText({
        model: openrouter(modelo),
        system: `${INSTRUCCIONES_ANALISTA}\n\nResponde SOLO con un objeto JSON válido que cumpla este JSON Schema, sin texto antes ni después:\n${FORMATO_RESPUESTA}`,
        prompt: `Expediente del predio:\n${JSON.stringify(expediente)}`,
        temperature: 0.2,
        maxOutputTokens: 6000,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(75_000),
      })
      const resultado = leerRespuestaIA(text)
      if (!resultado) {
        console.error('[analista-ia]', modelo, 'respuesta sin JSON válido:', text.slice(0, 200))
        continue
      }
      const analisis: AnalisisIAGuardado = { fecha: new Date().toISOString(), modelo, puntajeGlobal: puntajeGlobal(resultado), resultado }
      const supabase = await createClient()
      await supabase.from('data_points').upsert(
        { building_id: buildingId, categoria: 'ia', clave: 'analista', valor: analisis, estado: 'automatico', fecha_consulta: analisis.fecha },
        { onConflict: 'building_id,categoria,clave' }
      )
      await completarHuecos(supabase, buildingId, resultado, expediente.consultaAutomatica?.construccion?.areaConstruidaM2 ?? null)
      return { ok: true, analisis }
    } catch (e) {
      // Mensaje y respuesta del proveedor (sin el expediente ni la llave), para revisarlo en los logs de Vercel
      const cuerpo = typeof e === 'object' && e && 'responseBody' in e ? String((e as { responseBody?: unknown }).responseBody ?? '') : ''
      console.error('[analista-ia]', modelo, e instanceof Error ? e.message.slice(0, 200) : 'error desconocido', cuerpo.slice(0, 400))
    }
  }
  return { ok: false, error: 'fallo' }
}

export async function getAnalisisIA(buildingId: string): Promise<AnalisisIAGuardado | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('data_points').select('valor').eq('building_id', buildingId).eq('categoria', 'ia').eq('clave', 'analista').maybeSingle()
  return ((data as { valor: AnalisisIAGuardado } | null)?.valor) ?? null
}
