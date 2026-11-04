'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'
import { CANON_REFERENCIA, COSTO_OBRA_M2, EFICIENCIA, GASTOS_SOBRE_INGRESO, MESES_PRIMER_INGRESO } from '../catalogo/supuestos'
import { correrMayorMejorUso, PARAMETROS_DEFAULT } from '../lib/finanzas'
import { calcularFiltros } from '../lib/filtros'
import { correrTamizaje, puedeCorrerTamizaje } from '../lib/tamizaje'
import type { CategoriaUso } from '../types'
import { getConsultaAuto, getDocumentos, getFiltros, getItemsGuia, getUsos } from './consultas'

// Paso final de "Analizar el predio": completa los números que falten en cada uso con los
// supuestos de referencia, y corre el tamizaje y el mayor y mejor uso. Así el informe sale
// solo; el equipo después reemplaza los supuestos por datos reales y vuelve a correrlo.

type Supabase = Awaited<ReturnType<typeof createClient>>

const miles = (n: number) => n.toLocaleString('es-CO')

async function areaConstruida(supabase: Supabase, buildingId: string): Promise<number | null> {
  const consulta = await getConsultaAuto(buildingId)
  const { data } = await supabase.from('data_points').select('valor').eq('building_id', buildingId).eq('categoria', 'auto').eq('clave', 'catastral').maybeSingle()
  const catastral = (data as { valor: { areaConstruidaM2?: number | null } } | null)?.valor
  // El certificado catastral manda sobre la estimación por huellas
  return catastral?.areaConstruidaM2 ?? consulta?.construccion?.areaConstruidaM2 ?? null
}

/** Llena solo los números vacíos; devuelve cuántos usos se completaron */
async function completarNumeros(supabase: Supabase, buildingId: string): Promise<number> {
  const usos = (await getUsos(buildingId)).filter((u) => u.legal !== 'no' && u.fisico !== 'no')
  if (usos.length === 0) return 0
  const area = await areaConstruida(supabase, buildingId)
  let completados = 0
  for (const u of usos) {
    const ref = CANON_REFERENCIA[u.categoria as CategoriaUso]
    const m2 = u.m2Netos ?? (area ? Math.round((area * EFICIENCIA) / usos.length) : null)
    const canon = u.canonM2 ?? ref?.canonM2 ?? null
    if (m2 == null || canon == null) continue
    const cambios: Record<string, number | string> = {}
    if (u.m2Netos == null) cambios.m2_netos = m2
    if (u.canonM2 == null) cambios.canon_m2 = canon
    if (u.inversion == null) cambios.inversion = Math.round((m2 / EFICIENCIA) * COSTO_OBRA_M2.valor)
    if (u.gastosAnuales == null) cambios.gastos_anuales = Math.round(m2 * canon * u.ocupacion * 12 * GASTOS_SOBRE_INGRESO)
    if (u.mesesPrimerIngreso == null) cambios.meses_primer_ingreso = MESES_PRIMER_INGRESO
    if (Object.keys(cambios).length === 0) continue
    // Se deja escrito de dónde salen los números, para que el comercial los reemplace
    const nota = `Números con supuestos de referencia (validar): canon $${miles(canon)}/m² (${ref?.fuente.es ?? 'equipo'}), obra $${miles(COSTO_OBRA_M2.valor)}/m², gastos ${GASTOS_SOBRE_INGRESO * 100} % del ingreso, ${MESES_PRIMER_INGRESO} meses al primer ingreso${area && u.m2Netos == null ? `, ${miles(m2)} m² útiles de ${miles(area)} m² construidos` : ''}.`
    cambios.demanda_nota = u.demandaNota ? `${u.demandaNota} · ${nota}` : nota
    await supabase.from('candidate_uses').update({ ...cambios, updated_at: new Date().toISOString() }).eq('id', u.id)
    completados++
  }
  return completados
}

export async function correrAnalisisFinanciero(buildingId: string): Promise<{ error?: string; tamizaje?: boolean; mmu?: boolean; usosCompletados?: number }> {
  if (IS_DEMO) return { error: 'demo' }
  if (!z.uuid().safeParse(buildingId).success) return { error: 'invalido' }
  const profile = await requireProfile()
  const supabase = await createClient()
  const usosCompletados = await completarNumeros(supabase, buildingId)

  const [docs, items, usos, filtros] = await Promise.all([getDocumentos(buildingId), getItemsGuia(buildingId), getUsos(buildingId), getFiltros(buildingId)])
  let tamizaje = false
  if (puedeCorrerTamizaje(docs, usos)) {
    const resultado = correrTamizaje(docs, items, usos, calcularFiltros(filtros))
    const { error } = await supabase.from('analyses').insert({ building_id: buildingId, tipo: 'tamizaje', resultado, corrido_por: profile.id })
    if (!error) {
      tamizaje = true
      await supabase.from('buildings').update({ semaforo: resultado.semaforo }).eq('id', buildingId)
    }
  }

  // Mayor y mejor uso con los parámetros por defecto (tasa 12 %, 10 años): solo usos con números
  let mmu = false
  if (usos.some((u) => u.legal !== 'no' && u.fisico !== 'no' && u.m2Netos != null && u.canonM2 != null && (u.inversion ?? 0) > 0)) {
    const resultado = correrMayorMejorUso(usos, PARAMETROS_DEFAULT)
    const { error } = await supabase.from('analyses').insert({ building_id: buildingId, tipo: 'mayor_mejor_uso', resultado, corrido_por: profile.id })
    mmu = !error
  }
  revalidatePath(`/edificios/${buildingId}`, 'layout')
  return { tamizaje, mmu, usosCompletados }
}
