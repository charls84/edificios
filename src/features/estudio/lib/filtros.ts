import { COBERTURA_MINIMA, FILTROS, UMBRALES, type CodigoFiltro } from '../catalogo/filtros'

// Calculo de los 5 filtros. Sin IA: el equipo puntua cada criterio y la plataforma suma.
//   puntaje del filtro = suma de puntajes graduales / (2 x criterios graduales evaluados)  → 0 a 100
//   potencial total    = suma de (puntaje del filtro x peso) / suma de pesos de los filtros evaluados
//   veto               = un criterio de veto en 0 descarta el inmueble

export type Puntaje = 0 | 1 | 2

export interface EvaluacionCriterio {
  codigo: string
  puntaje: Puntaje | null
  nota: string | null
}

export type Lectura = 'alto' | 'medio' | 'bajo' | 'descartar' | 'incompleto'

export interface ResultadoFiltro {
  codigo: CodigoFiltro
  puntaje: number | null
  evaluados: number
  total: number
  vetoFallido: string | null
  vetoPendiente: boolean
}

export interface ResultadoFiltros {
  filtros: ResultadoFiltro[]
  potencial: number | null
  cobertura: number
  vetos: string[]
  lectura: Lectura
}

export function calcularFiltros(evaluaciones: EvaluacionCriterio[]): ResultadoFiltros {
  const por = new Map(evaluaciones.map((e) => [e.codigo, e.puntaje]))
  let gradualesTotal = 0
  let gradualesEvaluados = 0

  const filtros: ResultadoFiltro[] = FILTROS.map((f) => {
    const veto = f.criterios.find((c) => c.veto)
    const graduales = f.criterios.filter((c) => !c.veto)
    const evaluados = graduales.filter((c) => por.get(c.codigo) != null)
    const suma = evaluados.reduce((acc, c) => acc + (por.get(c.codigo) ?? 0), 0)
    gradualesTotal += graduales.length
    gradualesEvaluados += evaluados.length
    const puntajeVeto = veto ? por.get(veto.codigo) : undefined
    return {
      codigo: f.codigo,
      puntaje: evaluados.length ? Math.round((suma / (2 * evaluados.length)) * 100) : null,
      evaluados: evaluados.length + (puntajeVeto != null ? 1 : 0),
      total: f.criterios.length,
      vetoFallido: veto && puntajeVeto === 0 ? veto.codigo : null,
      vetoPendiente: Boolean(veto) && puntajeVeto == null,
    }
  })

  const conPuntaje = filtros.filter((f) => f.puntaje != null)
  const pesoDe = (c: CodigoFiltro) => FILTROS.find((f) => f.codigo === c)!.peso
  const pesos = conPuntaje.reduce((acc, f) => acc + pesoDe(f.codigo), 0)
  const potencial = pesos ? Math.round(conPuntaje.reduce((acc, f) => acc + f.puntaje! * pesoDe(f.codigo), 0) / pesos) : null
  const cobertura = gradualesTotal ? gradualesEvaluados / gradualesTotal : 0
  const vetos = filtros.flatMap((f) => (f.vetoFallido ? [f.vetoFallido] : []))

  let lectura: Lectura
  if (vetos.length) lectura = 'descartar'
  else if (potencial == null || cobertura < COBERTURA_MINIMA || filtros.some((f) => f.vetoPendiente)) lectura = 'incompleto'
  else lectura = potencial >= UMBRALES.alto ? 'alto' : potencial >= UMBRALES.medio ? 'medio' : 'bajo'

  return { filtros, potencial, cobertura, vetos, lectura }
}

// Color de la lectura del potencial (plano: lo usan componentes de servidor y de cliente)
export const COLOR_LECTURA: Record<Lectura, string> = {
  alto: 'bg-verde text-white',
  medio: 'bg-ambar text-white',
  bajo: 'bg-rojo text-white',
  descartar: 'bg-rojo-oscuro text-white',
  incompleto: 'bg-piedra text-medio-texto',
}
