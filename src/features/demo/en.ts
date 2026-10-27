import type { Edificio } from '@/features/ficha/types'

// Version en ingles del contenido del demo. Se aplica sobre los datos en espanol
// (mismo orden en los arreglos). Direcciones, CHIP y nombres propios no se traducen.
type Parcial<T> = T extends (infer U)[] ? Parcial<U>[] : T extends object ? { [K in keyof T]?: Parcial<T[K]> } : T

const ILUSTRACIONES = [{ alt: 'Main façade' }, { alt: 'Street context' }, { alt: 'Window and balcony detail' }]
const CATASTRO = 'Cadastre (sample)'
const POT = 'POT 555 (sample)'
const IDPC = 'IDPC (sample)'
const CERTIFICADO = 'Certificate of title (sample).pdf'
const CERT_EN = 'Certificate of title 50C-297658 (Oct 26, 2026)'
const LIC_EN = 'Permit LC 13-4-0066, Curaduría 4'
const IDPC_EN = 'IDPC Resolution 492 of 2012'
const PENDIENTE_EN = 'Pending lookup (Phase 0)'

export const EN: Record<string, Parcial<Edificio>> = {
  rolher: {
    nombre: 'Rolher Building',
    zona: 'Historic Center',
    fotos: [
      { alt: 'Stone façade on Carrera 10' },
      { alt: 'Open floor plan with new utilities' },
      { alt: 'Original curved staircase' },
      { alt: 'View of Monserrate from the roof' },
      { alt: 'TransMilenio corridor seen from the roof' },
    ],
    resumen:
      'Title free of attachments and mortgages, and a structure retrofitted under a 2013 permit. It is a listed heritage building in the Historic Center: any change of use needs heritage approval and a new permit.',
    alertas: [
      'Listed heritage building (Category B) in the Historic Center: a new project requires an IDPC opinion and authorization from the Ministry of Culture.',
      'The 2013 permit has expired. Confirm whether the work was completed and whether an occupancy permit exists.',
      'Lot areas do not match: 183.33 m² on the certificate of title and 173.33 m² on the permit. The IDU expropriated a 36.60 m² strip in 2012. Clarify with the Cadastre.',
      'The condominium regime was cancelled in 2011, but the certificate lists 23 derived registration numbers. Check that they are closed.',
    ],
    secciones: [
      {
        titulo: 'Property identification',
        datos: [
          { label: 'Property registration number', valor: '50C-297658 (active record)', fuente: `${CERT_EN}, p. 1` },
          { label: 'Lot area', valor: '183.33 m² per the certificate · 173.33 m² per the permit', fuente: `${CERT_EN}, p. 1 · ${LIC_EN}, p. 1` },
          { label: 'Built area', valor: '1,140.02 m²', fuente: `${LIC_EN}, p. 1` },
          { label: 'Floors', valor: '6 floors and basement · 20.55 m high', fuente: `${LIC_EN}, p. 1` },
          { label: 'Approved uses', valor: 'Retail 489 m² (1 unit) · offices 651 m² (4 units)', fuente: `${LIC_EN}, p. 1` },
        ],
      },
      {
        titulo: 'Zoning',
        datos: [
          { label: 'Zoning under which it was permitted (2013)', valor: 'Decree 492 of 2007 · UPZ 93 Las Nieves · urban renewal, reactivation mode', fuente: `${LIC_EN}, p. 1` },
          { label: 'Approved ratios', valor: 'Lot coverage 0.84 · floor area ratio 6.57', fuente: `${LIC_EN}, p. 1` },
          { label: 'Current zoning (POT Decree 555 of 2021)', valor: PENDIENTE_EN },
        ],
      },
      {
        titulo: 'Heritage',
        datos: [
          { label: 'District Asset of Cultural Interest (BIC)', valor: 'Yes · Category B, typological conservation (Decree 678 of 1994)', fuente: `${IDPC_EN}, p. 2` },
          { label: 'Historic Center (national BIC)', valor: 'Yes · project authorized by the Ministry of Culture (Res. 2724 of 2012)', fuente: `${LIC_EN}, p. 1` },
          { label: 'Intervention approved by the IDPC', valor: 'Partial demolition along Carrera 10, new stone façade, NSR-10 retrofit and one retail unit on the basement and ground floor', fuente: `${IDPC_EN}, p. 4` },
          { label: 'PEMP intervention level', valor: PENDIENTE_EN, fuente: 'Historic Center PEMP (Res. 088 of 2021)' },
        ],
      },
      {
        titulo: 'Permits',
        datos: [
          { label: 'Latest permit', valor: 'LC 13-4-0066 · final on Jan 28, 2013 · valid for 24 months, extendable by 12', fuente: `${LIC_EN}, p. 1` },
          { label: 'Permit types', valor: 'Alteration, partial demolition (57.37 m²) and structural retrofit', fuente: `${LIC_EN}, p. 1` },
          { label: 'Structure', valor: 'Reinforced concrete frames on spread footings · NSR-10 dynamic analysis', fuente: `${LIC_EN}, p. 1` },
          { label: 'Earlier permits', valor: 'LC 283 and LC 2710 (1988)', fuente: `${LIC_EN}, p. 1` },
        ],
      },
      {
        titulo: 'Hazard and risk',
        datos: [
          { label: 'Landslide', valor: 'Not applicable (per the 2013 permit)', fuente: `${LIC_EN}, p. 1` },
          { label: 'Flooding', valor: 'Not applicable (per the 2013 permit)', fuente: `${LIC_EN}, p. 1` },
          { label: 'Seismic microzone', valor: 'Piedemonte B', fuente: `${LIC_EN}, p. 1` },
        ],
      },
      {
        titulo: 'Incentives',
        datos: [
          { label: 'RenoBo zone', valor: PENDIENTE_EN },
          { label: '"Ciudad Inteligente" Agreement', valor: 'Possible exemption for the Historic Center (validity to be confirmed)', fuente: 'Internal rule' },
        ],
      },
    ],
    documento: {
      nombre: 'Certificate of title · October 26, 2026',
      extracciones: [
        { campo: 'Current owner', valor: 'Rolher Ltda. (company), since 1983' },
        { campo: 'Active attachments', valor: 'None in the 13 entries' },
        { campo: 'Active mortgages', valor: 'None' },
        { campo: 'Partial expropriation', valor: 'IDU, 36.60 m² (Res. 5253 of 2011), for public space on Carrera 10' },
        { campo: 'Condominium regime', valor: 'Created in 1991 and cancelled in 2011' },
        { campo: 'Registered address' },
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
