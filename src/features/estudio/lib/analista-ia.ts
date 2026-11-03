import { z } from 'zod'

// Contrato del analista de IA: qué recibe (el expediente del predio, sin datos personales)
// y qué devuelve (puntaje por dimensión, puntaje global y sugerencia con razones).

const ESTADOS_ITEM = ['cumple', 'no_cumple', 'por_verificar', 'no_aplica'] as const
const CATEGORIAS = ['vivienda', 'trabajo', 'comercio', 'otros', 'mixto'] as const
const VEREDICTOS = ['si', 'no', 'por_verificar'] as const

export const DIMENSIONES = ['ubicacion', 'estado_fisico', 'entorno', 'norma', 'juridico', 'cumplimiento', 'mercado', 'financiero'] as const
export type Dimension = (typeof DIMENSIONES)[number]

/** Peso de cada dimensión en el puntaje global (suman 100) */
export const PESOS_DIMENSION: Record<Dimension, number> = {
  ubicacion: 15, estado_fisico: 15, entorno: 10, norma: 20, juridico: 15, cumplimiento: 5, mercado: 10, financiero: 10,
}

const dimension = z.object({
  puntaje: z.number().min(0).max(100).nullable().describe('0 a 100. null si no hay datos suficientes para puntuar esta dimensión'),
  confianza: z.enum(['alta', 'media', 'baja']).describe('Qué tan completos y confiables son los datos de esta dimensión'),
  resumen: z.string().describe('Una o dos frases en español, concretas, con cifras del expediente'),
  evidencias: z.array(z.string()).describe('Máximo 5. Datos del expediente que sostienen el puntaje, citando la fuente entre paréntesis'),
  riesgos: z.array(z.string()).describe('Máximo 4. Riesgos de esta dimensión; vacío si no hay'),
})

export const esquemaAnalisisIA = z.object({
  decision: z.enum(['continuar', 'continuar_condiciones', 'descartar', 'falta_informacion']),
  resumenEjecutivo: z.string().describe('Tres a cinco frases para el comité: qué es el predio, su mayor fortaleza, su mayor riesgo y la recomendación'),
  usoRecomendado: z.string().nullable().describe('Uso o mezcla de usos que mejor encaja con lo que dicen los datos; null si no se puede sugerir'),
  dimensiones: z.object(Object.fromEntries(DIMENSIONES.map((d) => [d, dimension])) as Record<Dimension, typeof dimension>),
  condiciones: z.array(z.string()).describe('Máximo 8. Lo que debe cumplirse para avanzar'),
  proximosPasos: z.array(z.string()).describe('Máximo 6. Acciones concretas, en orden, con responsable sugerido (abogado, arquitecto, ingeniero, comercial)'),
  datosFaltantes: z.array(z.string()).describe('Máximo 8. Datos que cambiarían el puntaje si se consiguieran'),
  criterios: z.array(z.object({
    codigo: z.string().describe('Código del criterio, tal como viene en criteriosPendientes (ej. E3, N2, R1)'),
    puntaje: z.number().describe('0, 1 o 2, según los niveles del criterio'),
    nota: z.string().describe('Por qué, con la fuente entre paréntesis'),
  })).optional().describe('Solo criterios de criteriosPendientes que los datos permitan puntuar. Si no hay base, no lo incluyas'),
  checklist: z.array(z.object({
    codigo: z.string().describe('Código del ítem, tal como viene en checklistPendiente (ej. A3, C2, D4)'),
    estado: z.string().describe('Uno de: cumple, no_cumple, por_verificar, no_aplica'),
    nota: z.string().describe('Por qué, con la fuente entre paréntesis'),
  })).optional().describe('Solo ítems de checklistPendiente que los datos permitan resolver. Si no hay base, no lo incluyas'),
  usos: z.array(z.object({
    nombre: z.string().describe('Ej.: "Oficinas flexibles en pisos 3 a 6"'),
    categoria: z.string().describe('Uno de: vivienda, trabajo, comercio, otros, mixto'),
    legal: z.string().describe('Uno de: si, no, por_verificar'),
    fisico: z.string().describe('Uno de: si, no, por_verificar'),
    demanda: z.string().describe('Uno de: si, no, por_verificar'),
    nota: z.string().describe('Una frase: por qué este uso y qué hay que confirmar'),
  })).optional().describe('De 2 a 4 usos candidatos que tengan sentido con la norma, el edificio y la zona'),
})

export type AnalisisIA = z.infer<typeof esquemaAnalisisIA>

export interface AnalisisIAGuardado {
  fecha: string
  modelo: string
  puntajeGlobal: number | null
  resultado: AnalisisIA
}

/** Puntaje global: promedio ponderado de las dimensiones que sí tienen puntaje */
export function puntajeGlobal(a: AnalisisIA): number | null {
  let suma = 0
  let pesos = 0
  for (const d of DIMENSIONES) {
    const p = a.dimensiones[d].puntaje
    if (p == null) continue
    suma += Math.round(p) * PESOS_DIMENSION[d]
    pesos += PESOS_DIMENSION[d]
  }
  return pesos >= 50 ? Math.round(suma / pesos) : null
}

export const INSTRUCCIONES_ANALISTA = `Eres el analista de inversiones de Torna, un fondo que compra edificios antiguos en Bogotá para rehabilitarlos y darles un nuevo uso (vivienda, oficinas, comercio, hotel o mezcla).

Recibes el expediente de un predio en JSON. Viene de: consultas automáticas a Catastro Bogotá, DADEP y Jardín Botánico; la lectura del certificado de tradición y libertad y del certificado catastral; las fuentes en línea anotadas por el equipo; los 5 filtros de Torna (0 a 2 por criterio); la checklist A–F; la visita técnica calificada de 0 a 10; los usos candidatos y su análisis financiero; y una sugerencia por reglas.

Tu trabajo: puntuar de 0 a 100 cada dimensión y sugerir una decisión.

Dimensiones:
- ubicacion: acceso, transporte masivo, generadores de demanda, frente y visibilidad.
- estado_fisico: estructura, redes, acabados y estado general (visita técnica, licencias, pisos y sótanos).
- entorno: amenazas, seguridad, actividad, inversión pública (RenoBo, Metro), arbolado.
- norma: usos permitidos, tratamiento, condición patrimonial (BIC, PEMP, nivel), reserva vial, plusvalía, trámites.
- juridico: embargos, demandas, falsa tradición, número de dueños, propiedad horizontal, coherencia de áreas entre registro y Catastro.
- cumplimiento: riesgo de lavado de activos (extinción de dominio, SAE, Fiscalía, listas restrictivas).
- mercado: demanda por los usos posibles, valor de referencia del suelo, estrato, vacancia.
- financiero: rentabilidad, VPN y recuperación de los usos candidatos frente a la tasa mínima.

Reglas:
1. Usa solo lo que está en el expediente. No inventes cifras, normas ni nombres. Si una dimensión no tiene datos, pon puntaje null y confianza baja.
2. Cita la fuente de cada evidencia entre paréntesis: (Catastro), (certificado de tradición), (certificado catastral), (visita), (DADEP), (Jardín Botánico), (filtros), (análisis financiero).
3. Extinción de dominio, medida de la SAE o la Fiscalía, embargo o demanda vigente: cumplimiento o juridico en 0 a 20 y decisión "descartar".
4. Daño estructural severo (estructura de 0 a 2 en la visita): estado_fisico en 0 a 20 y decisión "descartar".
5. Si faltan los dos documentos base o la visita y no hay vetos, la decisión es "falta_informacion".
6. BIC nivel 2 o 3 no descarta: permite adecuar el interior con aprobación del IDPC. Nivel 1 limita mucho la intervención.
7. Si tu decisión difiere de la sugerencia por reglas, explica por qué en el resumen ejecutivo.
8. Escribe en español de Colombia, claro y directo, sin jerga. Cifras con separador de miles con punto.
9. criterios: el expediente trae "criteriosPendientes", los criterios de los 5 filtros que nadie ha puntuado, con sus niveles (0, 1, 2). Puntúa solo los que los datos sostengan; deja fuera los demás. Nunca pongas un veto en 0 sin una evidencia clara.
10. checklist: el expediente trae "checklistPendiente", los ítems de la checklist A–F sin resolver. Marca solo los que los datos sostengan: "cumple", "no_cumple", "por_verificar" (hay un indicio pero falta confirmar) o "no_aplica". En los ítems bloqueantes, "no_cumple" solo con evidencia clara.
11. usos: si el expediente no trae usos candidatos, propone de 2 a 4. Marca legal, fisico y demanda como "por_verificar" cuando no haya un dato que lo confirme.`

/**
 * Saca el JSON de la respuesta de un modelo (puede venir entre ```json o con texto alrededor)
 * y lo valida con el esquema. Los modelos gratuitos no siempre aceptan el modo estructurado.
 */
export function leerRespuestaIA(texto: string): AnalisisIA | null {
  const inicio = texto.indexOf('{')
  const fin = texto.lastIndexOf('}')
  if (inicio < 0 || fin <= inicio) return null
  try {
    const r = esquemaAnalisisIA.safeParse(JSON.parse(texto.slice(inicio, fin + 1)))
    if (!r.success) return null
    // Redondeo y topes de listas para que la tarjeta se vea pareja
    const a = r.data
    for (const d of DIMENSIONES) {
      const x = a.dimensiones[d]
      if (x.puntaje != null) x.puntaje = Math.round(x.puntaje)
      x.evidencias = x.evidencias.slice(0, 5)
      x.riesgos = x.riesgos.slice(0, 4)
    }
    return {
      ...a,
      condiciones: a.condiciones.slice(0, 8),
      proximosPasos: a.proximosPasos.slice(0, 6),
      datosFaltantes: a.datosFaltantes.slice(0, 8),
      // Solo puntajes válidos (0, 1 o 2) y como máximo 4 usos
      criterios: (a.criterios ?? []).filter((c) => [0, 1, 2].includes(c.puntaje)),
      // Lo que venga con un valor fuera de la lista se descarta o se corrige, sin perder el resto del análisis
      checklist: (a.checklist ?? []).filter((c) => (ESTADOS_ITEM as readonly string[]).includes(c.estado)),
      usos: (a.usos ?? []).slice(0, 4).map((u) => ({
        ...u,
        categoria: (CATEGORIAS as readonly string[]).includes(u.categoria) ? u.categoria : 'otros',
        legal: (VEREDICTOS as readonly string[]).includes(u.legal) ? u.legal : 'por_verificar',
        fisico: (VEREDICTOS as readonly string[]).includes(u.fisico) ? u.fisico : 'por_verificar',
        demanda: (VEREDICTOS as readonly string[]).includes(u.demanda) ? u.demanda : 'por_verificar',
      })),
    }
  } catch {
    return null
  }
}

/** Formato que se le pide al modelo, en JSON Schema */
export const FORMATO_RESPUESTA = JSON.stringify(z.toJSONSchema(esquemaAnalisisIA))
