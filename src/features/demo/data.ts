import type { Edificio } from '@/features/ficha/types'
import { aplicarTraduccion, EN } from './en'
import { ROLHER } from './rolher'

// Edificio Rolher: datos reales del informe de visita (ver rolher.ts).
// El resto son DATOS FICTICIOS para demostracion. No corresponden a predios, personas ni
// consultas reales. Direcciones y CHIP inventados; coordenadas aproximadas de la
// zona, solo para ubicar el marcador. Las fotos son ilustraciones generadas.
const HOY = '2026-10-20'

function fotos(id: string) {
  return [
    { src: `/demo/edificios/${id}-fachada.svg`, alt: 'Fachada principal', ilustrativa: true },
    { src: `/demo/edificios/${id}-contexto.svg`, alt: 'Contexto de la cuadra', ilustrativa: true },
    { src: `/demo/edificios/${id}-detalle.svg`, alt: 'Detalle de ventanas y balcones', ilustrativa: true },
  ]
}

export const EDIFICIOS_DEMO: Edificio[] = [
  ROLHER,
  {
    id: 'ejemplo-b',
    nombre: 'Edificio Ejemplo B',
    direccion: 'Carrera 00 # 0-02 (ficticia)',
    chip: 'DEMO000B002',
    zona: 'Teusaquillo',
    lat: 4.6297,
    lng: -74.0773,
    fotos: fotos('ejemplo-b'),
    etapa: 'en_analisis',
    semaforo: 'amarillo',
    resumen: 'Condicionado: está en sector de interés cultural y requiere concepto del IDPC.',
    alertas: ['Sector de interés cultural: requiere concepto técnico del IDPC', 'Hipoteca vigente (pág. 4 del certificado)'],
    secciones: [
      {
        titulo: 'Identificación catastral',
        datos: [
          { label: 'Área de terreno', valor: '420 m²', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Área construida', valor: '1.150 m²', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Pisos', valor: '3', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
        ],
      },
      {
        titulo: 'Patrimonio y PEMP',
        datos: [
          { label: 'Sector de interés cultural', valor: 'Sí', fuente: 'IDPC (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Concepto IDPC', valor: 'Pendiente de solicitar', fuente: 'Manual', fecha: HOY, estado: 'por_validar' },
        ],
      },
      {
        titulo: 'Amenaza y riesgo',
        datos: [{ label: 'Remoción en masa', valor: 'Baja', fuente: 'POT 555 (ejemplo)', fecha: HOY, estado: 'automatico' }],
      },
    ],
    documento: {
      nombre: 'Certificado de tradición (ejemplo).pdf',
      extracciones: [
        { campo: 'Matrícula inmobiliaria', valor: '50C-0000001', pagina: 1, estado: 'validado' },
        { campo: 'Hipotecas vigentes', valor: '1 hipoteca a favor de Banco Ejemplo', pagina: 4, estado: 'por_validar' },
      ],
    },
  },
  {
    id: 'ejemplo-c',
    nombre: 'Edificio Ejemplo C',
    direccion: 'Avenida 00 # 0-03 (ficticia)',
    chip: 'DEMO000C003',
    zona: 'Centro Histórico',
    lat: 4.6012,
    lng: -74.0703,
    fotos: fotos('ejemplo-c'),
    etapa: 'descartado',
    semaforo: 'rojo',
    resumen: 'Descartado: embargo activo y amenaza alta por remoción en masa.',
    alertas: ['Embargo activo (pág. 2 del certificado)', 'Amenaza alta por remoción en masa'],
    secciones: [
      {
        titulo: 'Amenaza y riesgo',
        datos: [{ label: 'Remoción en masa', valor: 'Alta', fuente: 'POT 555 (ejemplo)', fecha: HOY, estado: 'automatico' }],
      },
    ],
    documento: {
      nombre: 'Certificado de tradición (ejemplo).pdf',
      extracciones: [{ campo: 'Embargos vigentes', valor: '1 embargo ejecutivo', pagina: 2, estado: 'validado' }],
    },
  },
  {
    id: 'ejemplo-d',
    nombre: 'Edificio Ejemplo D',
    direccion: 'Calle 00 # 0-04 (ficticia)',
    chip: 'DEMO000D004',
    zona: 'Centro Histórico',
    lat: 4.6046,
    lng: -74.0729,
    fotos: fotos('ejemplo-d'),
    etapa: 'identificado',
    semaforo: 'amarillo',
    resumen: 'Datos oficiales cargados. Falta el certificado de tradición y la visita.',
    alertas: ['Falta certificado de tradición'],
    secciones: [
      {
        titulo: 'Identificación catastral',
        datos: [
          { label: 'Área construida', valor: '2.040 m²', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Pisos', valor: '5', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
        ],
      },
    ],
  },
]

export function getEdificiosDemo(locale: string): Edificio[] {
  return locale === 'en' ? EDIFICIOS_DEMO.map((e) => aplicarTraduccion(e, EN[e.id])) : EDIFICIOS_DEMO
}

export function getEdificioDemo(id: string, locale: string) {
  return getEdificiosDemo(locale).find((e) => e.id === id) ?? null
}
