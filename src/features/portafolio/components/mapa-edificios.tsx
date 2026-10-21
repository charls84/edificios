'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import type { Semaforo } from '@/features/ficha/types'
import type { ResumenEdificio } from '../services/edificios'

// Mapa abierto y sin llave (OpenFreeMap, datos de OpenStreetMap)
const ESTILO = 'https://tiles.openfreemap.org/styles/liberty'
const BOGOTA: [number, number] = [-74.075, 4.61]

const COLOR: Record<Semaforo, string> = { verde: '#2F7D4F', amarillo: '#C98A16', rojo: '#E50101' }

function popup(e: ResumenEdificio, verFicha: string) {
  const box = document.createElement('div')
  box.className = 'w-52 text-torna'
  if (e.foto) {
    const img = document.createElement('img')
    img.src = e.foto
    img.alt = ''
    img.className = 'mb-2 h-24 w-full rounded-lg object-cover'
    box.append(img)
  }
  const nombre = document.createElement('p')
  nombre.className = 'font-semibold'
  nombre.textContent = e.nombre
  const dir = document.createElement('p')
  dir.className = 'text-xs text-medio-texto'
  dir.textContent = e.direccion
  const link = document.createElement('a')
  link.href = `/edificios/${e.id}`
  link.className = 'mt-2 inline-block text-sm font-semibold text-rojo hover:underline'
  link.textContent = verFicha
  box.append(nombre, dir, link)
  return box
}

export function MapaEdificios({ edificios }: { edificios: ResumenEdificio[] }) {
  const t = useTranslations('portafolio')
  const contenedor = useRef<HTMLDivElement>(null)
  const sinUbicacion = edificios.every((e) => e.lat === null || e.lng === null)

  useEffect(() => {
    if (!contenedor.current) return
    const ubicados = edificios.filter((e) => e.lat !== null && e.lng !== null)
    const mapa = new maplibregl.Map({ container: contenedor.current, style: ESTILO, center: BOGOTA, zoom: 13 })
    mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    const limites = new maplibregl.LngLatBounds()
    for (const e of ubicados) {
      const punto = document.createElement('button')
      punto.type = 'button'
      punto.setAttribute('aria-label', t('verEnMapa', { nombre: e.nombre }))
      punto.className = 'h-5 w-5 rounded-full border-[3px] border-white shadow-md'
      punto.style.backgroundColor = e.semaforo ? COLOR[e.semaforo] : '#0B1F3A'
      new maplibregl.Marker({ element: punto })
        .setLngLat([e.lng!, e.lat!])
        .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false, focusAfterOpen: false }).setDOMContent(popup(e, t('verFicha'))))
        .addTo(mapa)
      limites.extend([e.lng!, e.lat!])
    }
    if (ubicados.length > 1) mapa.fitBounds(limites, { padding: 60, maxZoom: 15, duration: 0 })
    else if (ubicados.length === 1) mapa.setCenter([ubicados[0].lng!, ubicados[0].lat!]).setZoom(15)

    return () => mapa.remove()
  }, [edificios, t])

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-2xl border border-borde">
      <div ref={contenedor} className="h-full min-h-[360px] w-full" />
      {sinUbicacion && (
        <p className="absolute inset-x-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-sm text-medio-texto shadow">
          {t('sinUbicacion')}
        </p>
      )}
    </div>
  )
}
