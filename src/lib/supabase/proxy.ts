import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_COOKIE, IS_DEMO } from '@/shared/lib/demo'

// Rutas accesibles sin sesion. No hay registro publico: solo invitacion.
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/callback']
// Rutas que un usuario con sesion no deberia ver (lo mandamos al portafolio)
const GUEST_ONLY_ROUTES = ['/login', '/forgot-password']

function matches(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function guard(request: NextRequest, hasUser: boolean) {
  const { pathname } = request.nextUrl
  if (!hasUser && !matches(pathname, PUBLIC_ROUTES)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (hasUser && matches(pathname, GUEST_ONLY_ROUTES)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return null
}

export async function updateSession(request: NextRequest) {
  if (IS_DEMO) {
    return guard(request, request.cookies.has(DEMO_COOKIE)) ?? NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return guard(request, Boolean(user)) ?? supabaseResponse
}
