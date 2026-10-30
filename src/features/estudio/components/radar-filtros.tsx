import type { Texto } from '../types'
import type { ResultadoFiltro } from '../lib/filtros'

// Pentagono de los 5 filtros: cada eje va de 0 (centro) a 100 (borde)
interface Props {
  filtros: ResultadoFiltro[]
  titulos: Record<string, Texto>
  locale: string
  /** Tamano en px del lado del cuadro */
  tamano?: number
  etiquetas?: boolean
  descripcion: string
}

const R = 100
const angulo = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / 5
const punto = (i: number, r: number) => [Math.cos(angulo(i)) * r, Math.sin(angulo(i)) * r] as const
const poligono = (radios: number[]) => radios.map((r, i) => punto(i, r).join(',')).join(' ')

export function RadarFiltros({ filtros, titulos, locale, tamano = 280, etiquetas = true, descripcion }: Props) {
  const radios = filtros.map((f) => ((f.puntaje ?? 0) / 100) * R)
  // Las etiquetas laterales necesitan mas espacio a lo ancho que a lo alto
  const ancho = R + (etiquetas ? 96 : 8)
  const alto = R + (etiquetas ? 44 : 8)

  return (
    <svg viewBox={`${-ancho} ${-alto} ${ancho * 2} ${alto * 2}`} width={tamano} height={(tamano * alto) / ancho} role="img" aria-label={descripcion} className="mx-auto max-w-full">
      {[25, 50, 75, 100].map((n) => (
        <polygon key={n} points={poligono(Array(5).fill((n / 100) * R))} fill="none" stroke="#DDE1E6" strokeWidth={n === 100 ? 1.5 : 1} />
      ))}
      {filtros.map((_, i) => {
        const [x, y] = punto(i, R)
        return <line key={i} x1={0} y1={0} x2={x} y2={y} stroke="#DDE1E6" />
      })}
      <polygon points={poligono(radios)} fill="#0B1F3A" fillOpacity={0.18} stroke="#0B1F3A" strokeWidth={2} strokeLinejoin="round" />
      {filtros.map((f, i) => {
        const [x, y] = punto(i, radios[i])
        const color = f.vetoFallido ? '#E50101' : f.puntaje == null ? '#6D7989' : '#0B1F3A'
        return <circle key={f.codigo} cx={x} cy={y} r={f.vetoFallido ? 6 : 4} fill={color} />
      })}
      {etiquetas && filtros.map((f, i) => {
        const [x, yBase] = punto(i, R + 16)
        // La etiqueta de arriba sube para no tapar el vertice
        const y = i === 0 ? yBase - 14 : yBase
        const anchor = Math.abs(x) < 5 ? 'middle' : x > 0 ? 'start' : 'end'
        const titulo = locale === 'en' ? titulos[f.codigo].en : titulos[f.codigo].es
        return (
          <text key={f.codigo} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize={12} fill={f.vetoFallido ? '#B30000' : '#0B1F3A'}>
            <tspan fontWeight={600}>{titulo}</tspan>
            <tspan x={x} dy={15} fontSize={11} fill="#5B6675">{f.vetoFallido ? 'veto' : f.puntaje == null ? '—' : `${f.puntaje}`}</tspan>
          </text>
        )
      })}
    </svg>
  )
}
