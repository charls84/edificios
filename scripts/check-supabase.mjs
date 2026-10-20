// Verifica la conexión con Supabase sin imprimir ninguna llave.
// Uso: npm run check:supabase  (lee .env.local si existe)
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Detras de un proxy (entorno en la nube), el fetch de Node solo lo usa con NODE_USE_ENV_PROXY.
if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const child = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  })
  process.exit(child.status ?? 1)
}

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const TABLES = ['profiles', 'buildings', 'data_points', 'documents', 'extractions', 'visit_notes', 'data_sources']
const EXPECTED_SOURCES = 8
let failures = 0

function report(ok, label, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const secret = process.env.SUPABASE_SECRET_KEY

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
  SUPABASE_SECRET_KEY: secret,
})) {
  report(Boolean(value), `Variable ${name}`, value ? 'definida' : 'falta')
}
if (!url || !publishable || !secret) {
  console.log('\nCompleta las variables (ver docs/SETUP.md, Parte 4) y vuelve a correr.')
  process.exit(1)
}

try {
  const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: publishable } })
  report(res.ok, 'El proyecto responde', `HTTP ${res.status}`)
} catch {
  report(false, 'El proyecto responde', 'sin conexión. ¿Está permitido *.supabase.co en la red del entorno?')
  process.exit(1)
}

const admin = createClient(url, secret, { auth: { persistSession: false } })
const anon = createClient(url, publishable, { auth: { persistSession: false } })

for (const table of TABLES) {
  const { error } = await admin.from(table).select('*', { count: 'exact', head: true })
  report(!error, `Tabla ${table}`, error ? 'no existe: corre la migración (docs/SETUP.md, Parte 2)' : '')
}

const { count } = await admin.from('data_sources').select('*', { count: 'exact', head: true })
report(count === EXPECTED_SOURCES, 'Fuentes oficiales cargadas', `${count ?? 0} de ${EXPECTED_SOURCES}`)

const { data: leaked } = await anon.from('data_sources').select('id').limit(1)
report((leaked ?? []).length === 0, 'Reglas de acceso (RLS)', 'sin sesión no se leen datos')

const { data: bucket } = await admin.storage.getBucket('documentos')
report(bucket?.public === false, 'Almacenamiento privado de documentos', bucket ? '' : 'no existe')

const { count: admins } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin')
report((admins ?? 0) > 0, 'Primer administrador', `${admins ?? 0} admin(s) (docs/SETUP.md, Parte 3)`)

console.log(failures ? `\n${failures} punto(s) por resolver.` : '\nTodo listo: Supabase está conectado.')
process.exit(failures ? 1 : 0)
