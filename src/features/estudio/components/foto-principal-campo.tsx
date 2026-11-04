'use client'

/* eslint-disable @next/next/no-img-element -- vista previa local (blob) y foto ya publicada */
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

// Reduce la foto en el navegador (lado mayor 1600 px, JPEG 82 %): una foto de celular de
// 5 MB queda en unos 300 KB y entra en el formulario sin pasar el límite del servidor.
async function comprimir(archivo: File): Promise<File> {
  const imagen = await createImageBitmap(archivo)
  const escala = Math.min(1, 1600 / Math.max(imagen.width, imagen.height))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(imagen.width * escala)
  lienzo.height = Math.round(imagen.height * escala)
  lienzo.getContext('2d')!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
  const blob = await new Promise<Blob | null>((ok) => lienzo.toBlob(ok, 'image/jpeg', 0.82))
  if (!blob) throw new Error('compresion')
  return new File([blob], 'portada.jpg', { type: 'image/jpeg' })
}

// Foto principal del edificio: tarjeta del portafolio, mapa, resumen y portada del informe
export function FotoPrincipalCampo({ actual }: { actual: string | null }) {
  const t = useTranslations('estudio.formulario')
  const entrada = useRef<HTMLInputElement>(null)
  const [vista, setVista] = useState<string | null>(actual)
  const [quitar, setQuitar] = useState(false)
  const [estado, setEstado] = useState<'listo' | 'procesando' | 'error'>('listo')

  async function elegir(lista: FileList | null) {
    const archivo = lista?.[0]
    if (!archivo || !entrada.current) return
    setEstado('procesando')
    try {
      const reducido = await comprimir(archivo)
      // El archivo reducido reemplaza al original en el mismo campo del formulario
      const dt = new DataTransfer()
      dt.items.add(reducido)
      entrada.current.files = dt.files
      setVista(URL.createObjectURL(reducido))
      setQuitar(false)
      setEstado('listo')
    } catch {
      entrada.current.value = ''
      setEstado('error')
    }
  }

  return (
    <div className="md:col-span-2">
      <p className="etiqueta">{t('foto')}</p>
      <div className="mt-1 flex flex-col gap-4 rounded-xl border border-dashed border-borde p-3 sm:flex-row sm:items-center">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-piedra sm:w-56">
          {vista && !quitar ? <img src={vista} alt={t('fotoAlt')} className="h-full w-full object-cover" /> : (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-medio-texto">{t('fotoVacia')}</div>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-borde bg-white px-4 py-2 font-semibold hover:border-torna">
            {estado === 'procesando' ? t('fotoProcesando') : vista && !quitar ? t('fotoCambiar') : t('fotoSubir')}
            <input ref={entrada} type="file" name="foto" accept="image/*" className="sr-only" onChange={(e) => elegir(e.target.files)} />
          </label>
          {actual && (
            <label className="flex items-center gap-2 text-xs text-medio-texto">
              <input type="checkbox" name="quitarFoto" checked={quitar} onChange={(e) => setQuitar(e.target.checked)} />
              {t('fotoQuitar')}
            </label>
          )}
          <p className="text-xs text-medio-texto">{t('fotoAyuda')}</p>
          {estado === 'error' && <p role="alert" className="text-xs text-rojo-oscuro">{t('fotoError')}</p>}
        </div>
      </div>
    </div>
  )
}
