'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Foto } from '../types'

const INTERVALO_MS = 5000

export function Galeria({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const t = useTranslations('galeria')
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
      aria-roledescription={t('carrusel')}
      aria-label={t('fotosDe', { titulo })}
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
          aria-roledescription={t('foto')}
          aria-label={t('posicion', { actual: i + 1, total, alt: f.alt })}
          aria-hidden={i !== actual}
          className={`absolute inset-0 transition-opacity duration-700 ${i === actual ? 'opacity-100' : 'opacity-0'}`}
        >
          {f.ilustrativa || f.src.startsWith('/api/') ? (
            <Image src={f.src} alt={f.alt} fill unoptimized priority={i === 0} className="object-cover object-bottom" />
          ) : (
            <>
              {/* Fotos de cualquier proporcion: completa al centro sobre un fondo difuminado de si misma */}
              <Image src={f.src} alt="" aria-hidden fill className="scale-110 object-cover opacity-60 blur-2xl" sizes="100vw" />
              <Image src={f.src} alt={f.alt} fill priority={i === 0} className="object-contain" sizes="(min-width: 1024px) 1120px, 100vw" />
            </>
          )}
        </div>
      ))}

      {fotos[actual].ilustrativa && (
        <span className="absolute left-3 top-3 rounded-full bg-torna/85 px-3 py-1 text-xs font-medium text-white">
          {t('ilustrativa')}
        </span>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-torna/85 to-transparent p-4 pr-28 pt-12 sm:p-5 sm:pr-32 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {actual + 1} / {total}
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug text-white sm:text-lg">{fotos[actual].alt}</p>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => ir(actual - 1)}
            aria-label={t('anterior')}
            className="absolute left-3 top-1/2 hidden h-10 w-10 sm:flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-torna shadow hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => ir(actual + 1)}
            aria-label={t('siguiente')}
            className="absolute right-3 top-1/2 hidden h-10 w-10 sm:flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-torna shadow hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-5 sm:right-5">
            {fotos.map((f, i) => (
              <button
                key={f.src}
                type="button"
                onClick={() => ir(i)}
                aria-label={t('verFoto', { n: i + 1, alt: f.alt })}
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
