'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Foto } from '../types'

const INTERVALO_MS = 5000

export function Galeria({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const inicioToque = useRef<number | null>(null)
  const total = fotos.length

  const ir = useCallback((i: number) => setActual((i + total) % total), [total])

  useEffect(() => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (pausado || reducir || total < 2) return
    const t = setInterval(() => setActual((i) => (i + 1) % total), INTERVALO_MS)
    return () => clearInterval(t)
  }, [pausado, total])

  if (total === 0) return null

  return (
    <section
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${titulo}`}
      className="relative aspect-video overflow-hidden rounded-2xl bg-torna lg:aspect-[16/7]"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') ir(actual - 1)
        if (e.key === 'ArrowRight') ir(actual + 1)
      }}
      onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (inicioToque.current === null) return
        const dx = e.changedTouches[0].clientX - inicioToque.current
        if (Math.abs(dx) > 40) ir(actual + (dx < 0 ? 1 : -1))
        inicioToque.current = null
      }}
    >
      {fotos.map((f, i) => (
        <div
          key={f.src}
          role="group"
          aria-roledescription="foto"
          aria-label={`${i + 1} de ${total}: ${f.alt}`}
          aria-hidden={i !== actual}
          className={`absolute inset-0 transition-opacity duration-700 ${i === actual ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={f.src} alt={f.alt} fill unoptimized priority={i === 0} className="object-cover object-bottom" />
        </div>
      ))}

      {fotos[actual].ilustrativa && (
        <span className="absolute left-3 top-3 rounded-full bg-torna/85 px-3 py-1 text-xs font-medium text-white">
          Imagen ilustrativa
        </span>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-torna/85 to-transparent p-5 pt-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {actual + 1} / {total}
        </p>
        <p className="mt-1 text-lg font-semibold text-white">{fotos[actual].alt}</p>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => ir(actual - 1)}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-torna shadow hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => ir(actual + 1)}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-torna shadow hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-5 right-5 flex gap-2">
            {fotos.map((f, i) => (
              <button
                key={f.src}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ver foto ${i + 1}: ${f.alt}`}
                aria-current={i === actual}
                className={`h-2.5 rounded-full transition-all ${i === actual ? 'w-6 bg-rojo' : 'w-2.5 bg-white/70 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
