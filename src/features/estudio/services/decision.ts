import 'server-only'
import { resumirVisita } from '@/features/visita/lib/calificacion'
import { sugerirDecision, type SugerenciaDecision } from '../lib/decision'
import { calcularFiltros } from '../lib/filtros'
import type { ResultadoMayorMejorUso } from '../types'
import { getConsultaAuto, getDocumentos, getFiltros, getFuentes, getInformeVisita, getUltimoAnalisis } from './consultas'

// Junta todo lo que tiene la ficha y devuelve la sugerencia de decisión
export async function getDecision(buildingId: string): Promise<SugerenciaDecision> {
  const [docs, filtros, informe, consulta, mmu, fuentes] = await Promise.all([
    getDocumentos(buildingId),
    getFiltros(buildingId),
    getInformeVisita(buildingId),
    getConsultaAuto(buildingId),
    getUltimoAnalisis<ResultadoMayorMejorUso>(buildingId, 'mayor_mejor_uso'),
    getFuentes(buildingId),
  ])
  return sugerirDecision({
    filtros: calcularFiltros(filtros),
    docs,
    visita: resumirVisita(informe),
    consulta,
    mmu: mmu?.resultado ?? null,
    usosConsultados: Boolean(fuentes['sinupot.usos']?.texto),
  })
}
