import { getLocale, getTranslations } from 'next-intl/server'
import { InviteForm } from '@/features/equipo/components'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireAdmin } from '@/shared/lib/session'
import type { Profile } from '@/shared/types/database'

const MIEMBROS_DEMO: Record<string, Profile[]> = {
  es: [
    { id: '1', full_name: 'Fundador (ejemplo)', email: 'fundador@ejemplo.co', role: 'admin' },
    { id: '2', full_name: 'Analista (ejemplo)', email: 'analista@ejemplo.co', role: 'analista' },
  ] as Profile[],
  en: [
    { id: '1', full_name: 'Founder (sample)', email: 'founder@example.com', role: 'admin' },
    { id: '2', full_name: 'Analyst (sample)', email: 'analyst@example.com', role: 'analista' },
  ] as Profile[],
}

async function listMiembros() {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').order('created_at')
  return (data ?? []) as Profile[]
}

export default async function EquipoPage() {
  await requireAdmin()
  const miembros = IS_DEMO ? MIEMBROS_DEMO[await getLocale()] ?? MIEMBROS_DEMO.es : await listMiembros()
  const t = await getTranslations('equipo')

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{t('titulo')}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <section className="bento md:col-span-3">
          <h2 className="font-semibold">{t('miembros')}</h2>
          <ul className="mt-4 divide-y divide-borde">
            {miembros.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <span className="font-medium">{m.full_name ?? '—'}</span>
                  <span className="block text-medio-texto">{m.email}</span>
                </span>
                <span className="rounded-full bg-piedra px-3 py-1 text-xs">{t(`roles.${m.role}`)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="bento md:col-span-2">
          <h2 className="font-semibold">{t('invitarTitulo')}</h2>
          <p className="mt-1 text-sm text-medio-texto">{t('invitarTexto')}</p>
          <div className="mt-4">
            <InviteForm />
          </div>
        </section>
      </div>
    </>
  )
}
