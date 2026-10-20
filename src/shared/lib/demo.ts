// Modo demostracion: la app funciona sin Supabase, con datos ficticios.
// Se activa con NEXT_PUBLIC_DEMO_MODE=1, o solo si no hay Supabase configurado
// (sin base de datos no hay datos reales que mostrar). Nunca activarlo con datos reales.
export const IS_DEMO =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL
export const DEMO_COOKIE = 'demo_session'
