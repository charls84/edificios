// Secciones del informe que el equipo puede editar antes de exportarlo
export const SECCIONES_EDITABLES = ['portada', 'cap1', 'cap2', 'cap3', 'cap4', 'cap5', 'cap6', 'cap7', 'cap8', 'cap9', 'cap10'] as const
export type SeccionEditable = (typeof SECCIONES_EDITABLES)[number]

export interface NotaInforme {
  texto: string
  /** Solo en la portada: decisión que fija el equipo en lugar de la sugerida */
  decision: 'continuar' | 'continuar_condiciones' | 'descartar' | 'falta_informacion' | null
  autor: string
  fecha: string
}

export interface CambioInforme {
  seccion: SeccionEditable
  accion: 'agrego' | 'edito' | 'borro'
  autor: string
  fecha: string
}
