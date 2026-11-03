import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { fecha } from '../lib/texto'
import { BotonAnalizarPredio } from './boton-analizar-predio'

type Estado = 'hecho' | 'en_curso' | 'pendiente'

export interface DatosFlujo {
  edificioId: string
  creado: string
  /** Documentos base cargados (de 2) */
  documentosBase: number
  /** Fecha de la última consulta en línea y cuántas fuentes respondieron */
  consulta: { fecha: string; ok: number; total: number } | null
  visitaCalificadas: number
  ia: { fecha: string; puntaje: number | null } | null
  iaDisponible: boolean
}

const COLOR: Record<Estado, string> = { hecho: 'bg-verde text-white', en_curso: 'bg-ambar text-white', pendiente: 'bg-piedra text-medio-texto' }

// El flujo del estudio en cinco pasos, en orden: matricular → documentos → analizar el predio
// (documentos + fuentes en línea) → visita técnica → analista de IA.
export async function FlujoEstudio({ d, className = '' }: { d: DatosFlujo; className?: string }) {
  const [t, locale] = await Promise.all([getTranslations('estudio.flujo'), getLocale()])
  const base = `/edificios/${d.edificioId}`
  const pasos: { estado: Estado; titulo: string; detalle: string; href?: string; accion?: React.ReactNode }[] = [
    { estado: 'hecho', titulo: t('p1'), detalle: t('p1d', { fecha: fecha(locale, d.creado) }), href: `${base}/editar` },
    { estado: d.documentosBase === 2 ? 'hecho' : d.documentosBase > 0 ? 'en_curso' : 'pendiente', titulo: t('p2'), detalle: t('p2d', { n: d.documentosBase }), href: `${base}/documentos` },
    {
      estado: d.consulta ? 'hecho' : 'pendiente',
      titulo: t('p3'),
      detalle: d.consulta ? t('p3d', { fecha: fecha(locale, d.consulta.fecha), ok: d.consulta.ok, total: d.consulta.total }) : t('p3pendiente'),
      href: d.consulta ? `${base}/fuentes` : undefined,
      accion: <BotonAnalizarPredio edificioId={d.edificioId} yaAnalizado={Boolean(d.consulta)} iaDisponible={d.iaDisponible} />,
    },
    { estado: d.visitaCalificadas === 6 ? 'hecho' : d.visitaCalificadas > 0 ? 'en_curso' : 'pendiente', titulo: t('p4'), detalle: t('p4d', { n: d.visitaCalificadas }), href: `${base}/visita` },
    {
      estado: d.ia ? (d.consulta && new Date(d.ia.fecha) >= new Date(d.consulta.fecha) ? 'hecho' : 'en_curso') : 'pendiente',
      titulo: t('p5'),
      detalle: !d.iaDisponible ? t('p5sinLlave') : d.ia ? t('p5d', { fecha: fecha(locale, d.ia.fecha), puntaje: d.ia.puntaje ?? '—' }) : t('p5pendiente'),
      href: `${base}/analisis`,
    },
  ]
  const siguiente = pasos.findIndex((p) => p.estado !== 'hecho')

  return (
    <section className={`bento ${className}`} aria-labelledby="flujo-estudio">
      <h2 id="flujo-estudio" className="text-lg font-bold">{t('titulo')}</h2>
      <p className="mt-0.5 text-sm text-medio-texto">{t('texto')}</p>
      <ol className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-5">
        {pasos.map((p, i) => (
          <li key={i} className={`flex flex-col gap-2 rounded-xl border p-3 ${i === siguiente ? 'border-rojo bg-rojo-claro/40' : 'border-borde'}`}>
            <div className="flex items-center gap-2">
              <span aria-hidden className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${COLOR[p.estado]}`}>{p.estado === 'hecho' ? '✓' : i + 1}</span>
              <span className="text-sm font-semibold">{p.titulo}</span>
              <span className="sr-only">{t(`estado.${p.estado}`)}</span>
            </div>
            <p className="text-xs text-medio-texto">{p.detalle}</p>
            {p.accion}
            {p.href && <Link href={p.href} className="mt-auto text-xs text-rojo hover:underline">{t('ver')}</Link>}
          </li>
        ))}
      </ol>
    </section>
  )
}
