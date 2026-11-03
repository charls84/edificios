import 'server-only'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

// Proveedor de IA (OpenRouter). La llave va en la configuración del entorno (Vercel),
// nunca en el código. Sin llave, las funciones de IA se apagan y la plataforma sigue
// funcionando con el análisis por reglas.

// En Vercel la llave quedó como OPEN_ROUTER_API_KEY_TORNA; se aceptan los dos nombres
const LLAVE = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY_TORNA || ''

export const IA_DISPONIBLE = Boolean(LLAVE)

/**
 * Modelo del analista: razonamiento sobre datos estructurados en español, una corrida por
 * predio (no por usuario), así que se prefiere calidad sobre costo. Se cambia sin tocar
 * código con la variable TORNA_IA_MODELO.
 */
export const MODELO_ANALISTA = process.env.TORNA_IA_MODELO || 'anthropic/claude-sonnet-4.5'

export const openrouter = createOpenRouter({ apiKey: LLAVE })
