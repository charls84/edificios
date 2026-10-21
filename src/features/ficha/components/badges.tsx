import { useTranslations } from 'next-intl'
import type { EstadoDato, Semaforo } from '../types'

const SEMAFORO: Record<Semaforo, string> = {
  verde: 'bg-verde text-white',
  amarillo: 'bg-ambar text-white',
  rojo: 'bg-rojo text-white',
}

const ESTADO: Record<EstadoDato, string> = {
  automatico: 'bg-piedra text-medio-texto',
  por_validar: 'bg-ambar-claro text-torna',
  validado: 'bg-verde-claro text-verde',
}

export function SemaforoBadge({ semaforo }: { semaforo: Semaforo }) {
  const t = useTranslations('semaforo')
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${SEMAFORO[semaforo]}`}>{t(semaforo)}</span>
}

export function EstadoBadge({ estado }: { estado: EstadoDato }) {
  const t = useTranslations('estado')
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${ESTADO[estado]}`}>{t(estado)}</span>
}
