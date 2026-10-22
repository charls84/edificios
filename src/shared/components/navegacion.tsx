'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signout } from '@/features/auth/services/actions'
import { InstalarApp } from './instalar-app'
import { SelectorIdioma } from './selector-idioma'

const ICONOS = {
  portafolio: 'M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z',
  equipo: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M21 19v-1a4 4 0 0 0-3-3.9M15.5 4.1a3 3 0 0 1 0 5.8',
  salir: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11',
}

function Icono({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden>
      <path d={d} />
    </svg>
  )
}

function Logo({ alt }: { alt: string }) {
  return <Image src="/brand/torna-logo-oscuro.png" alt={alt} width={900} height={252} priority className="h-10 w-auto" />
}

interface Props {
  esAdmin: boolean
  usuario: string
}

function ContenidoMenu({ esAdmin, usuario, alNavegar }: Props & { alNavegar?: () => void }) {
  const t = useTranslations()
  const ruta = usePathname()
  const enlaces = [
    { href: '/dashboard', label: t('comun.portafolio'), icono: ICONOS.portafolio, activo: ruta === '/dashboard' || ruta.startsWith('/edificios') },
    ...(esAdmin ? [{ href: '/equipo', label: t('comun.equipo'), icono: ICONOS.equipo, activo: ruta.startsWith('/equipo') }] : []),
  ]

  return (
    <div className="flex h-full flex-col gap-6 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
      <ul className="space-y-1">
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              onClick={alNavegar}
              aria-current={e.activo ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                e.activo ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#E50101]' : 'text-white/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icono d={e.icono} />
              {e.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
        <div className="px-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">{t('idioma.etiqueta')}</p>
          <SelectorIdioma />
        </div>
        <InstalarApp />
        <p className="truncate px-3 text-sm text-white/70" title={usuario}>{usuario}</p>
        <form action={signout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white">
            <Icono d={ICONOS.salir} />
            {t('comun.salir')}
          </button>
        </form>
      </div>
    </div>
  )
}

export function Navegacion(props: Props) {
  const t = useTranslations()
  const [abierto, setAbierto] = useState(false)

  // Esc cierra el menu movil y bloquea el scroll del fondo mientras esta abierto
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('keydown', alTeclear)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = ''
    }
  }, [abierto])

  return (
    <>
      {/* Escritorio: barra lateral fija */}
      <aside aria-label={t('nav.navegacion')} className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-rojo bg-torna lg:flex">
        <Link href="/dashboard" aria-label={t('comun.irPortafolio')} className="px-6 pb-2 pt-6">
          <Logo alt={t('comun.logoAlt')} />
        </Link>
        <nav className="flex-1">
          <ContenidoMenu {...props} />
        </nav>
      </aside>

      {/* Movil y tablet: barra superior + panel lateral deslizable */}
      <header className="sticky top-0 z-30 border-b-2 border-rojo bg-torna pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex items-center gap-3 px-3 py-2">
          <button
            type="button"
            onClick={() => setAbierto(true)}
            aria-label={t('nav.abrirMenu')}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
          >
            <Icono d="M4 6h16M4 12h16M4 18h16" />
          </button>
          <Link href="/dashboard" aria-label={t('comun.irPortafolio')}>
            <Logo alt={t('comun.logoAlt')} />
          </Link>
        </div>
      </header>

      <div className={`fixed inset-0 z-40 lg:hidden ${abierto ? '' : 'pointer-events-none'}`} aria-hidden={!abierto}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={t('nav.cerrarMenu')}
          onClick={() => setAbierto(false)}
          className={`absolute inset-0 bg-torna/60 transition-opacity duration-300 ${abierto ? 'opacity-100' : 'opacity-0'}`}
        />
        <nav
          id="menu-movil"
          aria-label={t('nav.navegacion')}
          inert={!abierto}
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-torna pt-[env(safe-area-inset-top)] shadow-2xl transition-transform duration-300 ${
            abierto ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-3">
            <Logo alt={t('comun.logoAlt')} />
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label={t('nav.cerrarMenu')}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
            >
              <Icono d="M6 6l12 12M18 6 6 18" />
            </button>
          </div>
          <ContenidoMenu {...props} alNavegar={() => setAbierto(false)} />
        </nav>
      </div>
    </>
  )
}
