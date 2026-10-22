'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useSyncExternalStore } from 'react'

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const sinSuscripcion = () => () => {}

// "standalone" = ya se abrio como app instalada
function usePlataforma() {
  const standalone = useSyncExternalStore(
    sinSuscripcion,
    () => window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && Boolean((navigator as { standalone?: boolean }).standalone)),
    () => true
  )
  const ios = useSyncExternalStore(sinSuscripcion, () => /iphone|ipad|ipod/i.test(navigator.userAgent), () => false)
  return { standalone, ios }
}

export function InstalarApp() {
  const t = useTranslations('nav')
  const { standalone, ios } = usePlataforma()
  const [evento, setEvento] = useState<EventoInstalacion | null>(null)
  const [ayudaIos, setAyudaIos] = useState(false)

  useEffect(() => {
    const guardar = (e: Event) => {
      e.preventDefault()
      setEvento(e as EventoInstalacion)
    }
    const instalada = () => setEvento(null)
    window.addEventListener('beforeinstallprompt', guardar)
    window.addEventListener('appinstalled', instalada)
    return () => {
      window.removeEventListener('beforeinstallprompt', guardar)
      window.removeEventListener('appinstalled', instalada)
    }
  }, [])

  if (standalone || (!evento && !ios)) return null

  async function instalar() {
    if (ios) return setAyudaIos((v) => !v)
    await evento?.prompt()
    setEvento(null)
  }

  return (
    <div>
      <button
        type="button"
        onClick={instalar}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
          <path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t('instalar')}
      </button>
      {ayudaIos && (
        <div role="note" className="mx-3 mt-1 rounded-xl bg-white/10 p-3 text-xs text-white/85">
          <p className="font-semibold">{t('instalarIosTitulo')}</p>
          <p className="mt-1">{t.rich('instalarIosPasos', { b: (x) => <strong>{x}</strong> })}</p>
        </div>
      )}
    </div>
  )
}
