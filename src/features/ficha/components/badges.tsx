import type { Etapa } from '@/shared/types/database'
import type { EstadoDato, Semaforo } from '../types'

export const ETAPA_LABEL: Record<Etapa, string> = {
  identificado: 'Identificado',
  en_analisis: 'En análisis',
  presentado: 'Presentado',
  descartado: 'Descartado',
  en_intervencion: 'En intervención',
}

const SEMAFORO: Record<Semaforo, { label: string; clase: string }> = {
  verde: { label: 'Viable para presentar', clase: 'bg-verde text-white' },
  amarillo: { label: 'Condicionado', clase: 'bg-ambar text-white' },
  rojo: { label: 'Descartar o revisar a fondo', clase: 'bg-rojo text-white' },
}

const ESTADO: Record<EstadoDato, { label: string; clase: string }> = {
  automatico: { label: 'Automático', clase: 'bg-piedra text-medio-texto' },
  por_validar: { label: 'Por validar', clase: 'bg-ambar-claro text-torna' },
  validado: { label: 'Validado', clase: 'bg-verde-claro text-verde' },
}

export function SemaforoBadge({ semaforo }: { semaforo: Semaforo }) {
  const s = SEMAFORO[semaforo]
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.clase}`}>{s.label}</span>
}

export function EstadoBadge({ estado }: { estado: EstadoDato }) {
  const e = ESTADO[estado]
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${e.clase}`}>{e.label}</span>
}
