import type { Edificio } from '@/features/ficha/types'

// Edificio REAL. Fuentes: documentos entregados por el propietario y el informe
// de visita de Torna. Solo datos de los documentos; lo que no esta en ellos
// queda pendiente. No se publican nombres ni cedulas de personas (Ley 1581).
const R = '/demo/rolher'
const FECHA_DOCS = '2026-10-27'
const CERT = 'Certificado de tradición 50C-297658 (26-oct-2026)'
const LIC = 'Licencia LC 13-4-0066, Curaduría 4'
const IDPC = 'Resolución IDPC 492 de 2012'
const PENDIENTE = 'Pendiente de consulta (Fase 0)'

export const ROLHER: Edificio = {
  id: 'rolher',
  nombre: 'Edificio Rolher',
  direccion: 'Av. Jiménez (Calle 13) # 9-84, esquina Carrera 10',
  chip: 'AAA0257KADM',
  zona: 'Centro Histórico',
  // Ubicacion aproximada (esquina Av. Jimenez con Carrera 10); se confirma con Catastro
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
    'Propiedad sin embargos ni hipotecas y estructura reforzada con licencia de 2013. Es Bien de Interés Cultural en el Centro Histórico: cualquier cambio de uso necesita aprobación de patrimonio y una licencia nueva.',
  alertas: [
    'Bien de Interés Cultural (Categoría B) en el Centro Histórico: un nuevo proyecto requiere concepto del IDPC y autorización del Ministerio de Cultura.',
    'La licencia de 2013 venció. Confirmar si la obra se terminó y si existe el certificado de permiso de ocupación.',
    'El área del lote no coincide: 183,33 m² en el certificado y 173,33 m² en la licencia. El IDU expropió una franja de 36,60 m² en 2012. Aclarar con Catastro.',
    'La propiedad horizontal se canceló en 2011, pero el certificado lista 23 matrículas derivadas. Verificar que estén cerradas.',
  ],
  secciones: [
    {
      titulo: 'Identificación del predio',
      datos: [
        { label: 'Matrícula inmobiliaria', valor: '50C-297658 (folio activo)', fuente: `${CERT}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Área del lote', valor: '183,33 m² según el certificado · 173,33 m² según la licencia', fuente: `${CERT}, p. 1 · ${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Área construida', valor: '1.140,02 m²', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Pisos', valor: '6 pisos y sótano · 20,55 m de altura', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Usos aprobados', valor: 'Comercio 489 m² (1 local) · oficinas 651 m² (4 unidades)', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Norma urbana',
      datos: [
        { label: 'Norma con la que se licenció (2013)', valor: 'Decreto 492 de 2007 · UPZ 93 Las Nieves · renovación urbana, modalidad reactivación', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Índices aprobados', valor: 'Ocupación 0,84 · construcción 6,57', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Norma vigente (POT Decreto 555 de 2021)', valor: PENDIENTE, fuente: 'SINUPOT', fecha: FECHA_DOCS, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Patrimonio',
      datos: [
        { label: 'Bien de Interés Cultural distrital', valor: 'Sí · Categoría B, conservación tipológica (Decreto 678 de 1994)', fuente: `${IDPC}, p. 2`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Centro Histórico (BIC nacional)', valor: 'Sí · proyecto autorizado por el Ministerio de Cultura (Res. 2724 de 2012)', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Intervención aprobada por el IDPC', valor: 'Demolición parcial sobre la Carrera 10, fachada nueva en piedra, reforzamiento NSR-10 y un local en sótano y primer piso', fuente: `${IDPC}, p. 4`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Nivel de intervención PEMP', valor: PENDIENTE, fuente: 'PEMP Centro Histórico (Res. 088 de 2021)', fecha: FECHA_DOCS, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Licencias',
      datos: [
        { label: 'Última licencia', valor: 'LC 13-4-0066 · ejecutoriada el 28-ene-2013 · vigencia de 24 meses, prorrogable 12', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Modalidades', valor: 'Modificación, demolición parcial (57,37 m²) y reforzamiento estructural', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Estructura', valor: 'Pórticos de concreto reforzado sobre zapatas · análisis dinámico NSR-10', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Licencias anteriores', valor: 'LC 283 y LC 2710 (1988)', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Amenaza y riesgo',
      datos: [
        { label: 'Remoción en masa', valor: 'No aplica (según licencia de 2013)', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Inundación', valor: 'No aplica (según licencia de 2013)', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Microzonificación sísmica', valor: 'Piedemonte B', fuente: `${LIC}, p. 1`, fecha: FECHA_DOCS, estado: 'por_validar' },
      ],
    },
    {
      titulo: 'Incentivos',
      datos: [
        { label: 'Zona RenoBo', valor: PENDIENTE, fuente: 'RenoBo', fecha: FECHA_DOCS, estado: 'por_validar' },
        { label: 'Acuerdo "Ciudad Inteligente"', valor: 'Posible exención para el Centro Histórico (por confirmar vigencia)', fuente: 'Regla interna', fecha: FECHA_DOCS, estado: 'por_validar' },
      ],
    },
  ],
  documento: {
    nombre: 'Certificado de tradición y libertad · 26 de octubre de 2026',
    extracciones: [
      { campo: 'Propietario actual', valor: 'Rolher Ltda. (sociedad), desde 1983', pagina: 2, estado: 'por_validar' },
      { campo: 'Embargos vigentes', valor: 'Ninguno en las 13 anotaciones', pagina: 4, estado: 'por_validar' },
      { campo: 'Hipotecas vigentes', valor: 'Ninguna', pagina: 4, estado: 'por_validar' },
      { campo: 'Expropiación parcial', valor: 'IDU, 36,60 m² (Res. 5253 de 2011), para el espacio público de la Carrera 10', pagina: 3, estado: 'por_validar' },
      { campo: 'Propiedad horizontal', valor: 'Constituida en 1991 y cancelada en 2011', pagina: 3, estado: 'por_validar' },
      { campo: 'Dirección registrada', valor: 'Av. Jiménez de Quesada 9-82/88 · Calle 13 # 9-84 (catastral)', pagina: 1, estado: 'por_validar' },
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
