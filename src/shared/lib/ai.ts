import 'server-only'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

// Proveedor de IA (OpenRouter). La llave va en la configuración del entorno (Vercel),
// nunca en el código. Sin llave, las funciones de IA se apagan y la plataforma sigue
// funcionando con el análisis por reglas.

// En Vercel la llave quedó como OPEN_ROUTER_API_KEY_TORNA; se aceptan los dos nombres
const LLAVE = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY_TORNA || ''

export const IA_DISPONIBLE = Boolean(LLAVE)

export const openrouter = createOpenRouter({ apiKey: LLAVE })

/**
 * Modelo fijo opcional (de pago), por ejemplo "anthropic/claude-sonnet-4.5". Si no se
 * define TORNA_IA_MODELO, se usan los modelos gratuitos de OpenRouter (sin saldo).
 */
export const MODELO_FIJO = process.env.TORNA_IA_MODELO || null

interface ModeloOpenRouter {
  id: string
  context_length?: number
  supported_parameters?: string[]
}

// Familias que mejor siguen instrucciones y esquemas en español, en orden de preferencia
const PREFERIDOS = [/deepseek/i, /qwen/i, /llama-3\.3|llama-4/i, /gemini|gemma/i, /mistral/i, /gpt-oss/i]

/**
 * Modelos gratuitos (":free") disponibles hoy en OpenRouter que aceptan respuestas
 * estructuradas y expedientes largos. La lista cambia seguido: se consulta en vivo
 * (con caché de una hora) en vez de dejar un modelo fijo que puede desaparecer.
 */
export async function modelosGratis(max = 6): Promise<string[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) })
    const { data } = (await res.json()) as { data: ModeloOpenRouter[] }
    // Los "inkling" solo funcionan dentro de agentes de código: no sirven para una llamada directa
    const aptos = data.filter((m) => m.id.endsWith(':free') && !/inkling/i.test(m.id) && (m.context_length ?? 0) >= 32_000)
    const estructurado = (m: ModeloOpenRouter) => ((m.supported_parameters ?? []).some((p) => p === 'structured_outputs' || p === 'response_format') ? 0 : 1)
    const rango = (id: string) => { const i = PREFERIDOS.findIndex((re) => re.test(id)); return i < 0 ? PREFERIDOS.length : i }
    return aptos
      .sort((a, b) => rango(a.id) - rango(b.id) || estructurado(a) - estructurado(b) || (b.context_length ?? 0) - (a.context_length ?? 0))
      .slice(0, max)
      .map((m) => m.id)
  } catch {
    return []
  }
}

/** Modelos a probar, en orden: el fijo si existe; si no, los gratuitos de hoy */
export async function modelosAnalista(): Promise<string[]> {
  return MODELO_FIJO ? [MODELO_FIJO] : modelosGratis()
}
