import { InviteForm } from '@/features/equipo/components'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireAdmin } from '@/shared/lib/session'
import type { Profile } from '@/shared/types/database'

const ROLES: Record<Profile['role'], string> = {
  admin: 'Administrador',
  analista: 'Analista',
  sin_acceso: 'Sin acceso',
}

const MIEMBROS_DEMO = [
  { id: '1', full_name: 'Fundador (ejemplo)', email: 'fundador@ejemplo.co', role: 'admin' },
  { id: '2', full_name: 'Analista (ejemplo)', email: 'analista@ejemplo.co', role: 'analista' },
] as Profile[]

async function listMiembros() {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').order('created_at')
  return (data ?? []) as Profile[]
}

export default async function EquipoPage() {
  await requireAdmin()
  const miembros = IS_DEMO ? MIEMBROS_DEMO : await listMiembros()

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Equipo</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <section className="bento md:col-span-3">
          <h2 className="font-semibold">Miembros</h2>
          <ul className="mt-4 divide-y divide-borde">
            {miembros.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <span className="font-medium">{m.full_name ?? '—'}</span>
                  <span className="block text-medio-texto">{m.email}</span>
                </span>
                <span className="rounded-full bg-piedra px-3 py-1 text-xs">{ROLES[m.role]}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="bento md:col-span-2">
          <h2 className="font-semibold">Invitar persona</h2>
          <p className="mt-1 text-sm text-medio-texto">No hay registro público: solo entra quien invites.</p>
          <div className="mt-4">
            <InviteForm />
          </div>
        </section>
      </div>
    </>
  )
}
