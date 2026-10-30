'use client'

import { useTranslations } from 'next-intl'

// Exportar = imprimir a PDF desde el navegador (la hoja de estilos oculta la navegacion)
export function BotonImprimir() {
  const t = useTranslations('estudio.informe')
  return (
    <button type="button" onClick={() => window.print()} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-torna hover:bg-piedra print:hidden">
      {t('exportar')}
    </button>
  )
}
