'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { esFotoLocal, leerFoto } from '../lib/fotos-db'

// Muestra una foto del informe: publicada (ruta) o subida en este navegador (idb:)
export function FotoInforme({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!esFotoLocal(src)) return
    let url: string | null = null
    let vivo = true
    leerFoto(src).then((blob) => {
      if (blob && vivo) {
        url = URL.createObjectURL(blob)
        setBlobUrl(url)
      }
    })
    return () => {
      vivo = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [src])

  if (!esFotoLocal(src)) {
    return <Image src={src} alt={alt} width={600} height={800} sizes="(min-width: 768px) 25vw, 50vw" className={className} />
  }
  if (!blobUrl) return <div className={`${className} animate-pulse bg-piedra`} aria-label="Cargando foto" />
  // eslint-disable-next-line @next/next/no-img-element -- foto local (blob), no pasa por el optimizador
  return <img src={blobUrl} alt={alt} className={className} />
}
