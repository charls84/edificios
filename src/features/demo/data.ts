import type { Edificio } from '@/features/ficha/types'

// DATOS FICTICIOS para demostracion. No corresponden a predios, personas ni
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
  {
    id: 'ejemplo-a',
    nombre: 'Edificio Ejemplo A',
    direccion: 'Calle 00 # 0-01 (ficticia)',
    chip: 'DEMO000A001',
    zona: 'Centro Histórico',
    lat: 4.5976,
    lng: -74.0748,
    // Fotos reales aportadas por el cliente; el resto de datos de este edificio sigue siendo ficticio
    fotos: [
      { src: '/demo/fotos/ejemplo-a-1.jpg', alt: 'Fachada y esquina' },
      { src: '/demo/fotos/ejemplo-a-2.jpg', alt: 'Recorrido de la visita desde la acera' },
    ],
    etapa: 'presentado',
    semaforo: 'verde',
    resumen: 'Sin alertas fuertes. Uso residencial permitido e incentivo de renovación aplicable.',
    alertas: [],
    secciones: [
      {
        titulo: 'Identificación catastral',
        datos: [
          { label: 'Área de terreno', valor: '612 m²', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Área construida', valor: '3.180 m²', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Pisos', valor: '6', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Uso actual', valor: 'Oficinas (desocupado)', fuente: 'Catastro (ejemplo)', fecha: HOY, estado: 'automatico' },
        ],
      },
      {
        titulo: 'Norma POT',
        datos: [
          { label: 'Tratamiento', valor: 'Renovación urbana', fuente: 'POT 555 (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Usos permitidos', valor: 'Residencial, comercio, servicios', fuente: 'POT 555 (ejemplo)', fecha: HOY, estado: 'automatico' },
        ],
      },
      {
        titulo: 'Patrimonio y PEMP',
        datos: [
          { label: 'Bien de Interés Cultural', valor: 'No', fuente: 'IDPC (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Nivel de intervención PEMP', valor: 'Nivel 4: permite adecuación', fuente: 'IDPC (ejemplo)', fecha: HOY, estado: 'automatico' },
        ],
      },
      {
        titulo: 'Amenaza y riesgo',
        datos: [
          { label: 'Remoción en masa', valor: 'Baja', fuente: 'POT 555 (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Inundación', valor: 'No aplica', fuente: 'POT 555 (ejemplo)', fecha: HOY, estado: 'automatico' },
        ],
      },
      {
        titulo: 'Incentivos',
        datos: [
          { label: 'Zona RenoBo', valor: 'Sí', fuente: 'RenoBo (ejemplo)', fecha: HOY, estado: 'automatico' },
          { label: 'Acuerdo "Ciudad Inteligente"', valor: 'Aplica (por confirmar vigencia)', fuente: 'Regla interna', fecha: HOY, estado: 'por_validar' },
        ],
      },
    ],
    documento: {
      nombre: 'Certificado de tradición (ejemplo).pdf',
      extracciones: [
        { campo: 'Matrícula inmobiliaria', valor: '50C-0000000', pagina: 1, estado: 'validado' },
        { campo: 'Propietario', valor: 'Sociedad Ejemplo S.A.S.', pagina: 1, estado: 'validado' },
        { campo: 'Embargos vigentes', valor: 'Ninguno', pagina: 3, estado: 'validado' },
        { campo: 'Hipotecas vigentes', valor: 'Ninguna', pagina: 3, estado: 'validado' },
      ],
    },
    visita: { fecha: '2026-10-15', autor: 'Analista (ejemplo)', nota: 'Fachada en buen estado. Humedad en cubierta. Estructura aparente de concreto, sin fisuras visibles.' },
  },
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

export function getEdificioDemo(id: string) {
  return EDIFICIOS_DEMO.find((e) => e.id === id) ?? null
}
