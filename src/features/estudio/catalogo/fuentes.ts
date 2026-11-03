import type { Texto } from '../types'

// Consultas en línea que pidió Torna (3-nov-2026): con el CHIP y el certificado de tradición
// se consultan estas cinco fuentes oficiales. Cada hallazgo se anota en la ficha y alimenta
// los 5 filtros y la checklist A–F (campo `alimenta`).

export interface CampoFuente {
  codigo: string
  texto: Texto
  /** Ejemplo de lo que se anota */
  ejemplo: Texto
  /** Criterios de los 5 filtros o ítems A–F que este dato ayuda a resolver */
  alimenta: string[]
}

export interface Fuente {
  codigo: 'sinupot' | 'bic' | 'espacio_publico' | 'arbolado' | 'sae'
  nombre: Texto
  entidad: string
  url: string
  comoBuscar: Texto
  campos: CampoFuente[]
}

const t = (es: string, en: string): Texto => ({ es, en })

export const FUENTES: Fuente[] = [
  {
    codigo: 'sinupot',
    nombre: t('SINUPOT · norma urbana y licencias', 'SINUPOT · planning rules and permits'),
    entidad: 'Secretaría Distrital de Planeación',
    url: 'https://sinupot.sdp.gov.co/',
    comoBuscar: t('Buscar por CHIP en "Consulta de predios" y abrir la ficha normativa.', 'Search by CHIP in "Consulta de predios" and open the planning sheet.'),
    campos: [
      { codigo: 'upl', texto: t('UPL y área de actividad', 'UPL and activity area'), ejemplo: t('UPL Centro Histórico · Área de actividad grandes servicios metropolitanos', 'UPL Centro Histórico · metropolitan services area'), alimenta: ['B1', 'B2'] },
      { codigo: 'tratamiento', texto: t('Tratamiento urbanístico', 'Urban treatment'), ejemplo: t('Conservación (PEMP Centro Histórico)', 'Conservation (Historic Center PEMP)'), alimenta: ['R2', 'B2'] },
      { codigo: 'usos', texto: t('Usos permitidos y condicionados', 'Permitted and conditional uses'), ejemplo: t('Vivienda: permitido · comercio: permitido escala vecinal', 'Housing: permitted · retail: permitted, neighborhood scale'), alimenta: ['R1', 'B3'] },
      { codigo: 'edificabilidad', texto: t('Edificabilidad e índices', 'Buildable area and indexes'), ejemplo: t('Altura máxima según PEMP · índice de construcción', 'Max height per PEMP · construction index'), alimenta: ['B4'] },
      { codigo: 'licencias', texto: t('Licencias registradas', 'Registered permits'), ejemplo: t('LC 13-4-0066 (2013), Curaduría 4', 'LC 13-4-0066 (2013), Curaduría 4'), alimenta: ['A4', 'H3'] },
      { codigo: 'plusvalia', texto: t('Plusvalía y cargas', 'Land value capture and obligations'), ejemplo: t('Sin plusvalía registrada', 'No land value capture recorded'), alimenta: ['A5', 'B7'] },
      { codigo: 'riesgo', texto: t('Amenaza y riesgo', 'Hazard and risk'), ejemplo: t('Sin amenaza por remoción ni inundación', 'No landslide or flood hazard'), alimenta: ['N1'] },
    ],
  },
  {
    codigo: 'bic',
    nombre: t('Mapas Bogotá · patrimonio (BIC)', 'Mapas Bogotá · heritage (BIC)'),
    entidad: 'IDECA · IDPC',
    url: 'https://mapas.bogota.gov.co/?l=61568&e=-74.14935460883873,4.620915254405697,-74.0190636237315,4.68028563650382,4686&b=7256&show_menu=true&m=41900',
    comoBuscar: t('Buscar la dirección o el CHIP con la capa de Bienes de Interés Cultural activa y hacer clic en el predio.', 'Search the address or CHIP with the heritage layer on and click the lot.'),
    campos: [
      { codigo: 'es_bic', texto: t('¿Es Bien de Interés Cultural?', 'Is it a listed building (BIC)?'), ejemplo: t('Sí · ámbito distrital', 'Yes · district level'), alimenta: ['B5', 'R3'] },
      { codigo: 'nivel', texto: t('Categoría o nivel de intervención', 'Category or intervention level'), ejemplo: t('Nivel 2 · conservación tipológica', 'Level 2 · typological conservation'), alimenta: ['R3', 'CV5'] },
      { codigo: 'sector', texto: t('Sector de interés cultural o PEMP', 'Heritage area or PEMP'), ejemplo: t('Centro Histórico (BIC nacional), área afectada del PEMP', 'Historic Center (national BIC), PEMP area'), alimenta: ['B5', 'R5'] },
    ],
  },
  {
    codigo: 'espacio_publico',
    nombre: t('Observatorio DADEP · espacio público', 'DADEP observatory · public space'),
    entidad: 'Departamento Administrativo de la Defensoría del Espacio Público',
    url: 'https://geo.dadep.gov.co/observatorio/',
    comoBuscar: t('Ubicar el predio en el visor y revisar las capas de espacio público, zonas de cesión y RUPI alrededor.', 'Locate the lot in the viewer and check public space, dedication and RUPI layers around it.'),
    campos: [
      { codigo: 'colindancia', texto: t('Espacio público colindante', 'Adjacent public space'), ejemplo: t('Andén y plazoleta de la Carrera 10 (RUPI)', 'Sidewalk and plaza on Carrera 10 (RUPI)'), alimenta: ['U1', 'A6'] },
      { codigo: 'afectacion', texto: t('Afectaciones, cesiones o expropiaciones', 'Easements, dedications or expropriations'), ejemplo: t('Franja de 36,60 m² adquirida por el IDU (2012)', '36.60 m² strip acquired by IDU (2012)'), alimenta: ['A6', 'A7', 'U1'] },
      { codigo: 'ocupacion', texto: t('Ocupación o invasión del espacio público', 'Occupation of public space'), ejemplo: t('Sin ocupación registrada', 'No occupation recorded'), alimenta: ['A6', 'N2'] },
    ],
  },
  {
    codigo: 'arbolado',
    nombre: t('SIGAU · arbolado urbano', 'SIGAU · urban trees'),
    entidad: 'Jardín Botánico de Bogotá',
    url: 'https://geoportal.jbb.gov.co/SigauJBB/VisorPublico/VisorPublico',
    comoBuscar: t('Ubicar el predio y revisar los árboles registrados en el andén y el frente.', 'Locate the lot and check the trees recorded on the sidewalk and frontage.'),
    campos: [
      { codigo: 'arboles', texto: t('Árboles en el frente o el andén', 'Trees on the frontage or sidewalk'), ejemplo: t('2 árboles en el andén de la Carrera 10', '2 trees on the Carrera 10 sidewalk'), alimenta: ['C13', 'N2'] },
      { codigo: 'impacto', texto: t('Impacto en accesos, carga u obra', 'Impact on access, loading or works'), ejemplo: t('No interfieren con el acceso; obra sin tala', 'No access conflict; works without felling'), alimenta: ['C13', 'U4'] },
      { codigo: 'permiso', texto: t('Permiso ambiental requerido', 'Environmental permit required'), ejemplo: t('No · si se interviene, permiso de la Secretaría de Ambiente', 'No · if affected, Environment Secretariat permit'), alimenta: ['B9'] },
    ],
  },
  {
    // Pedido de Torna (3-nov-2026): descartar riesgo de lavado de activos antes de negociar.
    // Un "sí" en cualquiera de estos campos lleva la sugerencia de decisión a "no continuar".
    codigo: 'sae',
    nombre: t('SAE · lavado de activos y extinción de dominio', 'SAE · money laundering and asset forfeiture'),
    entidad: 'Sociedad de Activos Especiales',
    url: 'https://www.saesas.gov.co/',
    comoBuscar: t('Buscar el inmueble por dirección o matrícula en los bienes que administra la SAE. Cruzar con las anotaciones del certificado de tradición y con listas restrictivas de los propietarios. Escribe "Sí" o "No" al inicio de cada respuesta.', 'Look the property up by address or registration number among the assets SAE manages. Cross-check with the certificate of title entries and restrictive lists for the owners. Start each answer with "Yes" or "No".'),
    campos: [
      { codigo: 'inventario', texto: t('¿Lo administra la SAE o está en extinción de dominio?', 'Is it managed by SAE or under asset forfeiture?'), ejemplo: t('No · no figura en los bienes de la SAE (consulta del 3-nov-2026)', 'No · not among SAE assets (checked 3-Nov-2026)'), alimenta: ['H1', 'A1'] },
      { codigo: 'medidas', texto: t('¿El certificado tiene medidas de Fiscalía, extinción de dominio o embargos?', 'Does the certificate show prosecutor, forfeiture or attachment measures?'), ejemplo: t('No · sin anotaciones de Fiscalía ni de la SAE', 'No · no prosecutor or SAE entries'), alimenta: ['H1', 'A1'] },
      { codigo: 'listas', texto: t('¿Algún propietario aparece en listas restrictivas (ONU, OFAC, Procuraduría, Policía)?', 'Is any owner on restrictive lists (UN, OFAC, Inspector General, Police)?'), ejemplo: t('No · revisados los 2 propietarios del certificado', 'No · both owners on the certificate checked'), alimenta: ['H1', 'H2'] },
    ],
  },
]

export const CAMPOS_FUENTES = FUENTES.flatMap((f) => f.campos.map((c) => ({ ...c, fuente: f.codigo, clave: `${f.codigo}.${c.codigo}` })))
