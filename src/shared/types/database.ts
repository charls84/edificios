export type Role = 'sin_acceso' | 'analista' | 'admin'

export type Etapa =
  | 'identificado'
  | 'en_analisis'
  | 'presentado'
  | 'descartado'
  | 'en_intervencion'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: Role
  created_at: string
  updated_at: string
}
