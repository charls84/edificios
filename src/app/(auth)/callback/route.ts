import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Recibe los enlaces de invitacion y de recuperacion de contraseña.
// Acepta el flujo PKCE (?code=) y el de plantilla de correo (?token_hash=&type=).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'))

  const supabase = await createClient()
  let ok = false

  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error
  } else {
    // Las invitaciones traen la sesion en el fragmento (#access_token=...), que el servidor no ve.
    // El navegador conserva el fragmento al redirigir: /confirmar lo lee.
    return NextResponse.redirect(`${origin}/confirmar?next=${encodeURIComponent(next)}`)
  }

  return NextResponse.redirect(ok ? `${origin}${next}` : `${origin}/login?error=enlace_invalido`)
}

// Solo rutas internas, para que el enlace no pueda redirigir a otro sitio
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
}
