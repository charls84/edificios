import type { Edificio } from '@/features/ficha/types'

// Version en ingles del contenido del demo. Se aplica sobre los datos en espanol
// (mismo orden en los arreglos). Direcciones, CHIP y nombres propios no se traducen.
type Parcial<T> = T extends (infer U)[] ? Parcial<U>[] : T extends object ? { [K in keyof T]?: Parcial<T[K]> } : T

const ILUSTRACIONES = [{ alt: 'Main façade' }, { alt: 'Street context' }, { alt: 'Window and balcony detail' }]
const CATASTRO = 'Cadastre (sample)'
const POT = 'POT 555 (sample)'
const IDPC = 'IDPC (sample)'
const CERTIFICADO = 'Certificate of title (sample).pdf'

export const EN: Record<string, Parcial<Edificio>> = {
  rolher: {
    nombre: 'Rolher Building',
    zona: 'Downtown',
    fotos: [
      { alt: 'Stone façade on Carrera 10' },
      { alt: 'Open floor plan with new utilities' },
      { alt: 'Original curved staircase' },
      { alt: 'View of Monserrate from the roof' },
      { alt: 'TransMilenio corridor seen from the roof' },
    ],
    resumen:
      'Favorable site visit: structure brought up to NSR-10 and new utilities. Zoning, heritage and ownership still need to be validated (Phase 0).',
    alertas: [
      'Request the retrofit study and permit (NSR-10) from the owner.',
      'Request the RETIE electrical certification and the plumbing drawings.',
      'Stone façade of architectural value: check whether it is listed as an Asset of Cultural Interest (BIC).',
    ],
    secciones: [
      {
        titulo: 'Cadastral identification',
        datos: [
          { label: 'Lot area', fuente: CATASTRO },
          { label: 'Built area', valor: '3,180 m²', fuente: CATASTRO },
          { label: 'Floors', fuente: CATASTRO },
          { label: 'Current use', valor: 'Offices (vacant)', fuente: CATASTRO },
        ],
      },
      {
        titulo: 'POT zoning',
        datos: [
          { label: 'Planning treatment', valor: 'Urban renewal', fuente: POT },
          { label: 'Permitted uses', valor: 'Residential, retail, services', fuente: POT },
        ],
      },
      {
        titulo: 'Heritage and PEMP',
        datos: [
          { label: 'Asset of Cultural Interest (BIC)', valor: 'No', fuente: IDPC },
          { label: 'PEMP intervention level', valor: 'Level 4: allows adaptive reuse', fuente: IDPC },
        ],
      },
      {
        titulo: 'Hazard and risk',
        datos: [
          { label: 'Landslide', valor: 'Low', fuente: POT },
          { label: 'Flooding', valor: 'Not applicable', fuente: POT },
        ],
      },
      {
        titulo: 'Incentives',
        datos: [
          { label: 'RenoBo zone', valor: 'Yes', fuente: 'RenoBo (sample)' },
          { label: '"Ciudad Inteligente" Agreement', valor: 'Applies (validity to be confirmed)', fuente: 'Internal rule' },
        ],
      },
    ],
    documento: {
      nombre: CERTIFICADO,
      extracciones: [
        { campo: 'Property registration number' },
        { campo: 'Owner' },
        { campo: 'Active attachments', valor: 'None' },
        { campo: 'Active mortgages', valor: 'None' },
      ],
    },
    informe: {
      titulo: 'Technical site visit report',
      fecha: 'Sunday, October 18, 2026',
      hora: '9:00 a.m.',
      resumenTitulo: 'Structure and utilities ready for the new use',
      hallazgos: [
        { titulo: 'Structure retrofitted and brought up to NSR-10', texto: 'Columns and beams retrofitted and encased on the lower levels.' },
        { titulo: 'New electrical systems', texto: 'New panels, outlets, conduit and light fixtures.' },
        { titulo: 'New plumbing', texto: 'Ready to be extended to wherever it is needed.' },
      ],
      observaciones: [
        'Upper floors with peeling paint and plaster.',
        'Roof with waterproofing membrane and water tanks.',
        'Stone façade of architectural value.',
      ],
      documentosPorSolicitar: [
        'Retrofit study and permit (NSR-10).',
        'RETIE electrical certification · plumbing drawings.',
      ],
      secciones: [
        {
          etiqueta: 'Façade and entrance',
          titulo: 'A stone façade worth preserving',
          conclusion: {
            titulo: 'Stone, curves and ribbon windows: the features that give the building its identity.',
            texto: 'The ground floor is closed off with metal roller shutters, graffiti and posters. Restoring the façade is part of the project’s value.',
          },
          fotos: [
            { destacado: 'Façade', texto: 'at the corner.' },
            { destacado: 'Entrance', texto: 'and ground floor from the sidewalk.' },
          ],
        },
        {
          etiqueta: 'Structure',
          titulo: 'Structure retrofitted and upgraded to comply with NSR-10',
          fotos: [
            { destacado: 'Columns and beams', texto: 'encased and painted.' },
            { destacado: 'Concrete frame', texto: 'with generous cross-sections.' },
            { destacado: 'Walls and openings', texto: 'reworked in the basement.' },
            { destacado: 'Original curved staircase,', texto: 'a feature to preserve.' },
          ],
        },
        {
          etiqueta: 'Electrical systems',
          titulo: 'New electrical systems',
          fotos: [
            { destacado: 'Panel and conduit', texto: 'new on the ground floor.' },
            { destacado: 'Panel, switch and outlet', texto: 'next to the retail units.' },
            { destacado: 'Panel and outlet', texto: 'on the upper floors.' },
            { destacado: 'Panel', texto: 'next to the service core.' },
          ],
        },
        {
          etiqueta: 'Plumbing',
          titulo: 'New plumbing, ready to be extended',
          texto: 'Installed so it can be run to the points defined by the new design.',
          fotos: [
            { destacado: 'New piping', texto: 'exposed along beams and walls.' },
            { destacado: 'Runs along the perimeter', texto: 'of the open floor plan.' },
            { destacado: 'Water storage tanks', texto: 'on the roof.' },
          ],
        },
        {
          etiqueta: 'Condition of upper floors',
          titulo: 'Open floor plans that only need finishes',
          fotos: [
            { destacado: 'Open floor plan', texto: 'with good natural light.' },
            { destacado: 'Paint and plaster', texto: 'peeling.' },
            { destacado: 'Concrete staircase', texto: 'in the service core.' },
            { destacado: 'Staircase', texto: 'with original tile.' },
          ],
        },
        {
          etiqueta: 'Roof',
          titulo: 'Waterproofed roof with views of the eastern hills',
          fotos: [
            { destacado: 'Waterproofing membrane', texto: 'across the entire slab.' },
            { destacado: 'Membrane flashing', texto: 'on the parapet walls.' },
            { destacado: 'View of Monserrate', texto: 'from the terrace.' },
            { destacado: 'Large terrace', texto: 'with potential as a shared amenity.' },
          ],
        },
        {
          etiqueta: 'Surroundings',
          titulo: 'In the heart of downtown, next to TransMilenio',
          fotos: [
            { destacado: 'Pedestrian street', texto: 'in front of the building.' },
            { destacado: 'Corner', texto: 'with access to TransMilenio.' },
            { destacado: 'TransMilenio corridor', texto: 'seen from the roof.' },
            { destacado: 'Avenue and neighboring', texto: 'downtown buildings.' },
          ],
        },
      ],
    },
  },
  'ejemplo-b': {
    nombre: 'Example Building B',
    direccion: 'Carrera 00 # 0-02 (fictitious)',
    fotos: ILUSTRACIONES,
    resumen: 'Conditional: located in an area of cultural interest and requires a technical review from IDPC.',
    alertas: ['Area of cultural interest: requires a technical review from IDPC', 'Active mortgage (p. 4 of the certificate)'],
    secciones: [
      {
        titulo: 'Cadastral identification',
        datos: [
          { label: 'Lot area', fuente: CATASTRO },
          { label: 'Built area', valor: '1,150 m²', fuente: CATASTRO },
          { label: 'Floors', fuente: CATASTRO },
        ],
      },
      {
        titulo: 'Heritage and PEMP',
        datos: [
          { label: 'Area of cultural interest', valor: 'Yes', fuente: IDPC },
          { label: 'IDPC review', valor: 'Not yet requested', fuente: 'Manual entry' },
        ],
      },
      { titulo: 'Hazard and risk', datos: [{ label: 'Landslide', valor: 'Low', fuente: POT }] },
    ],
    documento: {
      nombre: CERTIFICADO,
      extracciones: [{ campo: 'Property registration number' }, { campo: 'Active mortgages', valor: '1 mortgage held by Banco Ejemplo' }],
    },
  },
  'ejemplo-c': {
    nombre: 'Example Building C',
    direccion: 'Avenida 00 # 0-03 (fictitious)',
    zona: 'Historic Center',
    fotos: ILUSTRACIONES,
    resumen: 'Discarded: active attachment on the title and high landslide hazard.',
    alertas: ['Active attachment (p. 2 of the certificate)', 'High landslide hazard'],
    secciones: [{ titulo: 'Hazard and risk', datos: [{ label: 'Landslide', valor: 'High', fuente: POT }] }],
    documento: { nombre: CERTIFICADO, extracciones: [{ campo: 'Active attachments', valor: '1 attachment from a debt collection lawsuit' }] },
  },
  'ejemplo-d': {
    nombre: 'Example Building D',
    direccion: 'Calle 00 # 0-04 (fictitious)',
    zona: 'Historic Center',
    fotos: ILUSTRACIONES,
    resumen: 'Official data loaded. The certificate of title and the site visit are still missing.',
    alertas: ['Certificate of title missing'],
    secciones: [
      {
        titulo: 'Cadastral identification',
        datos: [
          { label: 'Built area', valor: '2,040 m²', fuente: CATASTRO },
          { label: 'Floors', fuente: CATASTRO },
        ],
      },
    ],
  },
}

// Combina el contenido en espanol con su traduccion; los arreglos se combinan por posicion
export function aplicarTraduccion<T>(base: T, cambios: Parcial<T> | undefined): T {
  if (cambios === undefined) return base
  if (Array.isArray(base)) {
    const lista = cambios as unknown as unknown[]
    return base.map((x, i) => aplicarTraduccion(x, lista[i] as Parcial<typeof x>)) as T
  }
  if (base && typeof base === 'object') {
    const salida = { ...base } as Record<string, unknown>
    for (const [k, v] of Object.entries(cambios as object)) {
      salida[k] = aplicarTraduccion((base as Record<string, unknown>)[k], v as Parcial<unknown>)
    }
    return salida as T
  }
  return cambios as T
}
