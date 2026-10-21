import type { Edificio } from '@/features/ficha/types'

// Edificio REAL. Fuente unica: "Informe de visita tecnica · Edificio Rolher"
// (Torna, 18 de octubre de 2026). No inventar datos: lo que no esta en el
// informe queda pendiente de la Fase 0.
const R = '/demo/rolher'
const FECHA_EJEMPLO = '2026-10-20'

export const ROLHER: Edificio = {
  id: 'rolher',
  nombre: 'Edificio Rolher',
  direccion: 'Carrera 10 # 13-22',
  chip: null,
  zona: 'Centro',
  // Ubicacion aproximada por direccion; se confirma con Catastro en la Fase 0
  lat: 4.6029,
  lng: -74.0762,
  fotos: [
    { src: `${R}/fachada-esquina.jpg`, alt: 'Fachada en piedra sobre la Carrera 10' },
    { src: `${R}/hidraulica-tuberia.jpg`, alt: 'Planta libre con redes nuevas' },
    { src: `${R}/estructura-escalera-curva.jpg`, alt: 'Escalera curva original' },
    { src: `${R}/cubierta-monserrate.jpg`, alt: 'Vista a Monserrate desde la cubierta' },
    { src: `${R}/entorno-transmilenio.jpg`, alt: 'Corredor de TransMilenio desde la cubierta' },
  ],
  etapa: 'en_analisis',
  semaforo: 'amarillo',
  resumen:
    'Visita técnica favorable: estructura actualizada a la NSR-10 y redes nuevas. Falta validar norma, patrimonio y propiedad (Fase 0).',
  alertas: [
    'Solicitar al propietario el estudio y la licencia del reforzamiento (NSR-10).',
    'Solicitar la certificación RETIE y los planos hidrosanitarios.',
    'Fachada en piedra con valor arquitectónico: verificar si es Bien de Interés Cultural.',
  ],
  // Datos oficiales DE EJEMPLO (no consultados): se reemplazan con las fuentes reales en la Fase 0
  datosDeEjemplo: true,
  secciones: [
    {
      titulo: 'Identificación catastral',
      datos: [
        { label: 'Área de terreno', valor: '612 m²', fuente: 'Catastro (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
        { label: 'Área construida', valor: '3.180 m²', fuente: 'Catastro (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
        { label: 'Pisos', valor: '6', fuente: 'Catastro (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
        { label: 'Uso actual', valor: 'Oficinas (desocupado)', fuente: 'Catastro (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Norma POT',
      datos: [
        { label: 'Tratamiento', valor: 'Renovación urbana', fuente: 'POT 555 (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
        { label: 'Usos permitidos', valor: 'Residencial, comercio, servicios', fuente: 'POT 555 (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Patrimonio y PEMP',
      datos: [
        { label: 'Bien de Interés Cultural', valor: 'No', fuente: 'IDPC (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
        { label: 'Nivel de intervención PEMP', valor: 'Nivel 4: permite adecuación', fuente: 'IDPC (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Amenaza y riesgo',
      datos: [
        { label: 'Remoción en masa', valor: 'Baja', fuente: 'POT 555 (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
        { label: 'Inundación', valor: 'No aplica', fuente: 'POT 555 (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Incentivos',
      datos: [
        { label: 'Zona RenoBo', valor: 'Sí', fuente: 'RenoBo (ejemplo)', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
        { label: 'Acuerdo "Ciudad Inteligente"', valor: 'Aplica (por confirmar vigencia)', fuente: 'Regla interna', fecha: FECHA_EJEMPLO, estado: 'por_validar' },
      ],
    },
  ],
  documento: {
    nombre: 'Certificado de tradición (ejemplo).pdf',
    extracciones: [
      { campo: 'Matrícula inmobiliaria', valor: '50C-0000000', pagina: 1, estado: 'por_validar' },
      { campo: 'Propietario', valor: 'Sociedad Ejemplo S.A.S.', pagina: 1, estado: 'por_validar' },
      { campo: 'Embargos vigentes', valor: 'Ninguno', pagina: 3, estado: 'por_validar' },
      { campo: 'Hipotecas vigentes', valor: 'Ninguna', pagina: 3, estado: 'por_validar' },
    ],
  },
  informe: {
    titulo: 'Informe de visita técnica',
    fecha: 'Domingo 18 de octubre de 2026',
    hora: '9:00 a. m.',
    autor: 'Daniela Céspedes · Torna',
    pdf: `${R}/informe-visita-1.pdf`,
    resumenTitulo: 'Estructura y redes listas para el nuevo uso',
    hallazgos: [
      { titulo: 'Estructura intervenida y actualizada a la NSR-10', texto: 'Columnas y vigas intervenidas y recubiertas en los niveles inferiores.' },
      { titulo: 'Redes eléctricas nuevas', texto: 'Tableros, tomas, tubería y luminarias nuevas.' },
      { titulo: 'Redes hidráulicas nuevas', texto: 'Listas para extenderse a los puntos que se necesiten.' },
    ],
    observaciones: [
      'Pisos superiores con pintura y pañete desprendidos.',
      'Cubierta con manto impermeabilizante y tanques de agua.',
      'Fachada en piedra con valor arquitectónico.',
    ],
    documentosPorSolicitar: [
      'Estudio y licencia del reforzamiento (NSR-10).',
      'Certificación RETIE · planos hidrosanitarios.',
    ],
    secciones: [
      {
        numero: '01',
        etiqueta: 'Fachada y acceso',
        titulo: 'Una fachada en piedra que vale la pena conservar',
        conclusion: {
          titulo: 'Piedra, curvas y ventanas en franja: piezas que le dan identidad al edificio.',
          texto: 'El primer piso está cerrado con cortinas metálicas, grafiti y afiches. Recuperar la fachada es parte del valor del proyecto.',
        },
        fotos: [
          { src: `${R}/fachada-esquina.jpg`, destacado: 'Fachada', texto: 'sobre la esquina.' },
          { src: `${R}/fachada-acera.jpg`, destacado: 'Acceso', texto: 'y primer piso desde la acera.' },
        ],
      },
      {
        numero: '02',
        etiqueta: 'Estructura',
        titulo: 'Estructura intervenida y actualizada para cumplir la NSR-10',
        fotos: [
          { src: `${R}/estructura-columnas.jpg`, destacado: 'Columnas y vigas', texto: 'recubiertas y pintadas.' },
          { src: `${R}/estructura-portico.jpg`, destacado: 'Pórtico de concreto', texto: 'de sección amplia.' },
          { src: `${R}/estructura-muros-sotano.jpg`, destacado: 'Muros y vanos', texto: 'intervenidos en el sótano.' },
          { src: `${R}/estructura-escalera-curva.jpg`, destacado: 'Escalera curva original,', texto: 'pieza para conservar.' },
        ],
      },
      {
        numero: '03',
        etiqueta: 'Redes eléctricas',
        titulo: 'Redes eléctricas nuevas',
        fotos: [
          { src: `${R}/electrica-primer-piso.jpg`, destacado: 'Tablero y tubería', texto: 'nuevos en el primer piso.' },
          { src: `${R}/electrica-locales.jpg`, destacado: 'Tablero, interruptor y toma', texto: 'junto a los locales.' },
          { src: `${R}/electrica-pisos-superiores.jpg`, destacado: 'Tablero y toma', texto: 'en pisos superiores.' },
          { src: `${R}/electrica-punto-fijo.jpg`, destacado: 'Tablero', texto: 'junto al punto fijo.' },
        ],
      },
      {
        numero: '04',
        etiqueta: 'Redes hidráulicas',
        titulo: 'Redes hidráulicas nuevas, listas para extenderse',
        texto: 'Instaladas para llevarlas a los puntos que defina el nuevo diseño.',
        fotos: [
          { src: `${R}/hidraulica-tuberia.jpg`, destacado: 'Tubería nueva', texto: 'a la vista sobre vigas y muros.' },
          { src: `${R}/hidraulica-perimetro.jpg`, destacado: 'Recorridos por el perímetro', texto: 'de la planta libre.' },
          { src: `${R}/hidraulica-tanques.jpg`, destacado: 'Tanques de almacenamiento', texto: 'de agua en la cubierta.' },
        ],
      },
      {
        numero: '05',
        etiqueta: 'Estado de los pisos superiores',
        titulo: 'Plantas libres que solo necesitan acabados',
        fotos: [
          { src: `${R}/pisos-planta-libre.jpg`, destacado: 'Planta libre', texto: 'con buena luz natural.' },
          { src: `${R}/pisos-panete.jpg`, destacado: 'Pintura y pañete', texto: 'desprendidos.' },
          { src: `${R}/pisos-escalera-concreto.jpg`, destacado: 'Escalera de concreto', texto: 'del punto fijo.' },
          { src: `${R}/pisos-escalera-baldosa.jpg`, destacado: 'Escalera con baldosa', texto: 'original.' },
        ],
      },
      {
        numero: '06',
        etiqueta: 'Cubierta',
        titulo: 'Cubierta impermeabilizada, con vista a los cerros',
        fotos: [
          { src: `${R}/cubierta-manto.jpg`, destacado: 'Manto impermeabilizante', texto: 'en toda la losa.' },
          { src: `${R}/cubierta-remates.jpg`, destacado: 'Remates del manto', texto: 'en los muros de borde.' },
          { src: `${R}/cubierta-monserrate.jpg`, destacado: 'Vista a Monserrate', texto: 'desde la terraza.' },
          { src: `${R}/cubierta-terraza.jpg`, destacado: 'Terraza amplia', texto: 'con potencial de uso común.' },
        ],
      },
      {
        numero: '07',
        etiqueta: 'Entorno',
        titulo: 'En el corazón del Centro, junto a TransMilenio',
        fotos: [
          { src: `${R}/entorno-peatonal.jpg`, destacado: 'Calle peatonal', texto: 'frente al edificio.' },
          { src: `${R}/entorno-esquina.jpg`, destacado: 'Esquina', texto: 'con acceso a TransMilenio.' },
          { src: `${R}/entorno-transmilenio.jpg`, destacado: 'Corredor de TransMilenio', texto: 'visto desde la cubierta.' },
          { src: `${R}/entorno-avenida.jpg`, destacado: 'Avenida y edificios', texto: 'vecinos del Centro.' },
        ],
      },
    ],
  },
}
