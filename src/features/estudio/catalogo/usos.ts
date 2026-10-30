import type { CategoriaUso, Texto } from '../types'

// Usos candidatos tipicos para empezar la lista (guia, seccion 01)
export const USOS_TIPICOS: { categoria: CategoriaUso; nombre: Texto }[] = [
  { categoria: 'vivienda', nombre: { es: 'Apartaestudios', en: 'Studio apartments' } },
  { categoria: 'vivienda', nombre: { es: 'Vivienda estudiantil', en: 'Student housing' } },
  { categoria: 'vivienda', nombre: { es: 'Coliving', en: 'Coliving' } },
  { categoria: 'vivienda', nombre: { es: 'Renta corta', en: 'Short-term rental' } },
  { categoria: 'vivienda', nombre: { es: 'Vivienda para arriendo', en: 'Rental housing' } },
  { categoria: 'trabajo', nombre: { es: 'Oficinas tradicionales', en: 'Traditional offices' } },
  { categoria: 'trabajo', nombre: { es: 'Oficinas flexibles / coworking', en: 'Flexible offices / coworking' } },
  { categoria: 'trabajo', nombre: { es: 'Consultorios', en: 'Medical offices' } },
  { categoria: 'comercio', nombre: { es: 'Comercio de barrio', en: 'Neighborhood retail' } },
  { categoria: 'comercio', nombre: { es: 'Gastronomía', en: 'Food and beverage' } },
  { categoria: 'comercio', nombre: { es: 'Servicios', en: 'Services' } },
  { categoria: 'comercio', nombre: { es: 'Bodegaje de última milla', en: 'Last-mile storage' } },
  { categoria: 'otros', nombre: { es: 'Hotel u hostal', en: 'Hotel or hostel' } },
  { categoria: 'otros', nombre: { es: 'Educación', en: 'Education' } },
  { categoria: 'otros', nombre: { es: 'Cultura', en: 'Culture' } },
  { categoria: 'mixto', nombre: { es: 'Mixto: comercio abajo y otro uso arriba', en: 'Mixed: retail below and another use above' } },
]

export const CATEGORIAS_USO: CategoriaUso[] = ['vivienda', 'trabajo', 'comercio', 'otros', 'mixto']
