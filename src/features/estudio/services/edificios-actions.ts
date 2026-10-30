'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'
import type { ActionState } from '@/features/auth/types'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'

const texto = (max: number) => z.string().trim().max(max)
const opcional = (max: number) => texto(max).transform((v) => v || null)
const coordenada = (min: number, max: number) =>
  z.string().trim().transform((v) => (v ? Number(v.replace(',', '.')) : null))
    .pipe(z.number().min(min).max(max).nullable())

const edificioSchema = z.object({
  nombre: texto(120).min(2, 'escribeNombre'),
  direccion: texto(200).min(5, 'escribeDireccion'),
  chip: opcional(20).transform((v) => v?.toUpperCase() ?? null),
  matricula: opcional(30),
  zona: opcional(80),
  origen: opcional(120),
  contacto: opcional(200),
  lat: coordenada(-90, 90),
  lng: coordenada(-180, 180),
  notas: opcional(2000),
})

const ETAPAS = ['identificado', 'en_analisis', 'presentado', 'descartado', 'en_intervencion'] as const

function filaDesde(d: z.infer<typeof edificioSchema>) {
  return {
    nombre: d.nombre,
    direccion: d.direccion,
    chip: d.chip,
    matricula_inmobiliaria: d.matricula,
    zona: d.zona,
    origen: d.origen,
    contacto: d.contacto,
    lat: d.lat,
    lng: d.lng,
    notas: d.notas,
    updated_at: new Date().toISOString(),
  }
}

export async function crearEdificio(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile()
  const t = await getTranslations('errores')
  if (IS_DEMO) return { error: t('soloModoReal') }
  const parsed = edificioSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: t(parsed.error.issues[0].message as 'escribeNombre') }

  const supabase = await createClient()
  // El CHIP es la llave del predio: si ya existe, se abre la ficha existente
  if (parsed.data.chip) {
    const { data: existente } = await supabase.from('buildings').select('id').eq('chip', parsed.data.chip).maybeSingle()
    if (existente) redirect(`/edificios/${(existente as { id: string }).id}?existente=1`)
  }

  const { data, error } = await supabase
    .from('buildings')
    .insert({ ...filaDesde(parsed.data), created_by: profile.id })
    .select('id')
    .single()
  if (error || !data) return { error: t('noSeGuardo') }

  revalidatePath('/dashboard')
  redirect(`/edificios/${(data as { id: string }).id}`)
}

export async function actualizarEdificio(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile()
  const t = await getTranslations()
  if (IS_DEMO) return { error: t('errores.soloModoReal') }
  const parsed = edificioSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: t(`errores.${parsed.error.issues[0].message as 'escribeNombre'}`) }

  const supabase = await createClient()
  const { error } = await supabase.from('buildings').update(filaDesde(parsed.data)).eq('id', id)
  if (error) return { error: error.code === '23505' ? t('errores.chipRepetido') : t('errores.noSeGuardo') }

  revalidatePath(`/edificios/${id}`, 'layout')
  revalidatePath('/dashboard')
  return { success: t('estudio.guardado') }
}

export async function cambiarEtapa(id: string, etapa: string) {
  await requireProfile()
  if (IS_DEMO) return
  const valor = ETAPAS.find((e) => e === etapa)
  if (!valor) return
  const supabase = await createClient()
  await supabase.from('buildings').update({ etapa: valor, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath(`/edificios/${id}`, 'layout')
  revalidatePath('/dashboard')
}

export async function eliminarEdificio(id: string) {
  const profile = await requireProfile()
  if (IS_DEMO || profile.role !== 'admin') return
  const supabase = await createClient()
  await supabase.from('buildings').delete().eq('id', id)
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
