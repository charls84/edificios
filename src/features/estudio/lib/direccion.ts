// Convierte una dirección de Bogotá al formato de las placas domiciliarias de Catastro.
// "Av. Jiménez (Calle 13) # 9-84" → vías ['CL 13', 'AC 13'] y placa '9 84'.
// Catastro guarda la vía en PDONVIAL ("CL 13 ") y el número en PDOTEXTO ("9 84").

export interface DireccionCatastral {
  vias: string[]
  placa: string
}

const TIPOS: [RegExp, string[]][] = [
  [/^(avenida\s+calle|av\.?\s*calle|ac)$/i, ['AC', 'CL']],
  [/^(avenida\s+carrera|av\.?\s*carrera|av\.?\s*cra|ak)$/i, ['AK', 'KR']],
  [/^(calle|cll?|cl\.)$/i, ['CL', 'AC']],
  [/^(carrera|cra|kra|kr|cr|crr)\.?$/i, ['KR', 'AK']],
  [/^(diagonal|dg|diag)\.?$/i, ['DG']],
  [/^(transversal|tv|tr|transv)\.?$/i, ['TV']],
]

const PATRON =
  /(avenida\s+calle|avenida\s+carrera|av\.?\s*calle|av\.?\s*carrera|av\.?\s*cra|calle|cll?|cl\.|carrera|cra|kra|kr|crr|cr|diagonal|diag|dg|transversal|transv|tv|tr|ac|ak)\.?\s+(\d{1,3}\s*[a-z]?(?:\s*bis)?(?:\s*[a-z])?(?:\s*(?:sur|este))?)\s*\)?\s*(?:#|no\.?|n°|nº|número|numero)?\s*(\d{1,3}\s*[a-z]?(?:\s*bis)?)\s*-\s*(\d{1,3})/i

const limpiar = (s: string) => s.replace(/\s+/g, ' ').trim().toUpperCase()

export function parsearDireccion(texto: string): DireccionCatastral | null {
  const m = PATRON.exec(texto.normalize('NFD').replace(/[̀-ͯ]/g, ''))
  if (!m) return null
  const tipo = TIPOS.find(([re]) => re.test(m[1].trim()))
  if (!tipo) return null
  const numeroVia = limpiar(m[2]).replace(/(\d)\s+([A-Z])/g, '$1$2')
  const cruce = limpiar(m[3]).replace(/(\d)\s+([A-Z])/g, '$1$2')
  return {
    vias: tipo[1].map((t) => `${t} ${numeroVia}`),
    placa: `${cruce} ${Number(m[4])}`,
  }
}
