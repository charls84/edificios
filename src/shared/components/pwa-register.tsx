'use client'

import { useEffect } from 'react'

// Registra el service worker. Debe estar en el layout raiz.
export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let intervalo: ReturnType<typeof setInterval> | undefined
    // CRITICO: URL absoluta con window.location.origin (iOS rechaza redirecciones 307)
    navigator.serviceWorker
      .register(`${window.location.origin}/sw.js`, { scope: '/' })
      .then((registro) => {
        intervalo = setInterval(() => registro.update(), 60 * 60 * 1000)
      })
      .catch(() => undefined)
    return () => clearInterval(intervalo)
  }, [])
  return null
}
