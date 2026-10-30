'use client'

import type { EmailOtpType } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Recibe los enlaces de correo (invitacion y recuperacion) en sus tres formatos:
//   1. #access_token=...&refresh_token=...  (invitaciones enviadas por el admin)
//   2. ?token_hash=...&type=...             (plantilla de correo propia; pide un clic, asi
//                                            los escaneres de correo no gastan el enlace)
//   3. #error_code=otp_expired              (enlace vencido o ya usado)
const TIPOS: EmailOtpType[] = ['invite', 'recovery', 'signup', 'magiclink', 'email', 'email_change']

// Solo rutas internas, para que el enlace no pueda redirigir a otro sitio
const rutaSegura = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/update-password')

type Estado = 'revisando' | 'boton' | 'error' | 'entrando'
type Token = { hash: string; tipo: EmailOtpType; next: string }

async function resolver(query: URLSearchParams, hash: URLSearchParams): Promise<{ estado: Estado | 'listo'; token?: Token }> {
  const next = rutaSegura(query.get('next'))
  const accessToken = hash.get('access_token')
  const refreshToken = hash.get('refresh_token')
  if (accessToken && refreshToken) {
    const { error } = await createClient().auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    return { estado: error ? 'error' : 'listo' }
  }
  const tokenHash = query.get('token_hash')
  const tipo = query.get('type') as EmailOtpType | null
  if (tokenHash && tipo && TIPOS.includes(tipo)) return { estado: 'boton', token: { hash: tokenHash, tipo, next } }
  return { estado: 'error' }
}

export function ConfirmarEnlace() {
  const t = useTranslations('auth.confirmar')
  const [estado, setEstado] = useState<Estado>('revisando')
  const [token, setToken] = useState<Token | null>(null)
  const leido = useRef(false)

  useEffect(() => {
    if (leido.current) return
    leido.current = true
    // Se lee la direccion una sola vez y se limpia: los tokens no deben quedar en el historial
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    window.history.replaceState(null, '', window.location.pathname)
    void resolver(query, hash).then(({ estado: nuevo, token: pendiente }) => {
      if (pendiente) setToken(pendiente)
      if (nuevo === 'listo') window.location.replace(pendiente?.next ?? rutaSegura(query.get('next')))
      else setEstado(nuevo)
    })
  }, [])

  async function continuar() {
    if (!token) return
    setEstado('entrando')
    const { error } = await createClient().auth.verifyOtp({ token_hash: token.hash, type: token.tipo })
    if (error) setEstado('error')
    else window.location.replace(token.next)
  }

  if (estado === 'revisando' || estado === 'entrando') {
    return <p role="status" className="text-sm text-medio-texto">{t('entrando')}</p>
  }
  if (estado === 'boton') {
    return (
      <div className="space-y-4">
        <p className="text-sm">{t('textoBoton')}</p>
        <button type="button" onClick={continuar} className="boton">{t('continuar')}</button>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p role="alert" className="rounded-xl bg-rojo-claro px-3 py-2 text-sm text-rojo-oscuro">{t('error')}</p>
      <p className="text-sm text-medio-texto">{t('queHacer')}</p>
      <Link href="/forgot-password" className="boton">{t('pedirNuevo')}</Link>
      <Link href="/login" className="block text-center text-sm text-rojo hover:underline">{t('volver')}</Link>
    </div>
  )
}
