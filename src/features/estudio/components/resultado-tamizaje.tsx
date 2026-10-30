import { useLocale, useTranslations } from 'next-intl'
import { SemaforoBadge } from '@/features/ficha/components/badges'
import { documentoPorCodigo } from '../catalogo/documentos'
import { ITEMS_GUIA } from '../catalogo/guia'
import { tx } from '../lib/texto'
import type { ResultadoTamizaje } from '../types'

const textoItem = (codigo: string, locale: string) => {
  const item = ITEMS_GUIA.find((x) => x.codigo === codigo)
  return item ? `${codigo} · ${tx(item.texto, locale)}` : codigo
}
const textoDoc = (codigo: string, locale: string) => {
  const d = documentoPorCodigo(codigo)
  return d ? `${codigo} · ${tx(d.nombre, locale)}` : codigo
}

function Lista({ titulo, items, tono = 'normal' }: { titulo: string; items: string[]; tono?: 'normal' | 'rojo' }) {
  if (items.length === 0) return null
  return (
    <div className={`rounded-xl p-4 ${tono === 'rojo' ? 'bg-rojo-claro' : 'bg-fondo'}`}>
      <h4 className={`text-sm font-semibold ${tono === 'rojo' ? 'text-rojo-oscuro' : ''}`}>{titulo}</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((x) => <li key={x}>{x}</li>)}
      </ul>
    </div>
  )
}

export function ResultadoTamizaje({ r }: { r: ResultadoTamizaje }) {
  const t = useTranslations('estudio.analisis.tamizaje')
  const tv = useTranslations('estudio.usos.veredictos')
  const locale = useLocale()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SemaforoBadge semaforo={r.semaforo} />
        <p className="text-sm">{t(`lectura.${r.semaforo}`)}</p>
      </div>

      <Lista titulo={t('bloqueos')} items={r.bloqueos.map((c) => textoItem(c, locale))} tono="rojo" />
      <Lista titulo={t('minimoFaltante')} items={r.documentosMinimoFaltantes.map((c) => textoDoc(c, locale))} />
      <Lista titulo={t('pendientes')} items={r.pendientes.map((c) => textoItem(c, locale))} />

      {r.usos.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-borde">
          <table className="w-full text-sm">
            <thead className="bg-fondo text-left text-xs uppercase tracking-wider text-medio-texto">
              <tr><th className="px-3 py-2">{t('uso')}</th><th className="px-3 py-2">{t('norma')}</th><th className="px-3 py-2">{t('edificio')}</th></tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {r.usos.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 font-medium">{u.nombre}</td>
                  <td className="px-3 py-2">{tv(u.pasaLegal)}</td>
                  <td className="px-3 py-2">{u.pasaLegal === 'no' ? '—' : tv(u.pasaFisica)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details>
        <summary className="cursor-pointer text-sm font-semibold">{t('paraEstudio', { n: r.documentosParaEstudio.length })}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-medio-texto">
          {r.documentosParaEstudio.map((c) => <li key={c}>{textoDoc(c, locale)}</li>)}
        </ul>
      </details>
    </div>
  )
}
