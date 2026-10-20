// Modo demostracion: la app funciona sin Supabase, con datos ficticios.
// Se activa con NEXT_PUBLIC_DEMO_MODE=1. Nunca activarlo con datos reales.
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === '1'
export const DEMO_COOKIE = 'demo_session'
