import type { Texto } from '../types'

// Los 5 filtros de Torna (ubicacion, estructura, entorno, norma e historia): tamizaje rapido.
// PROPUESTA de DOUX.WORK para validar con Torna (2026-10-30). Metodo del Transformation Meter
// (Geraedts y van der Voordt, TU Delft): cada filtro tiene un criterio de VETO que descarta de una
// y criterios GRADUALES que puntuan 0 (desfavorable), 1 (aceptable) o 2 (favorable).
// Adaptado a Bogota: POT Decreto 555 de 2021, niveles de intervencion BIC, IDIGER, RenoBo.

export type CodigoFiltro = 'ubicacion' | 'estructura' | 'entorno' | 'norma' | 'historia'

export interface CriterioFiltro {
  codigo: string
  texto: Texto
  /** Veto: si no cumple, el inmueble se descarta sin importar el puntaje */
  veto?: boolean
  /** Que significa cada puntaje (0, 1, 2). En un veto: [no cumple, -, cumple] */
  niveles: [Texto, Texto, Texto]
  fuente: Texto
}

export interface Filtro {
  codigo: CodigoFiltro
  titulo: Texto
  pregunta: Texto
  /** Peso en el potencial total (suman 100) */
  peso: number
  criterios: CriterioFiltro[]
}

const t = (es: string, en: string): Texto => ({ es, en })

export const FILTROS: Filtro[] = [
  {
    codigo: 'ubicacion',
    titulo: t('Ubicación', 'Location'),
    pregunta: t('¿Está donde la gente quiere y puede llegar?', 'Is it where people want to be and can get to?'),
    peso: 20,
    criterios: [
      {
        codigo: 'U1', veto: true,
        texto: t('Acceso por vía pública y sin afectación vial o de reserva sobre todo el predio', 'Public road access and no road or reserve easement over the whole lot'),
        niveles: [t('Sin acceso o afectado en su totalidad', 'No access or fully affected'), t('—', '—'), t('Tiene acceso y la afectación es parcial o nula', 'Has access; easement partial or none')],
        fuente: t('Mapas Bogotá · certificado de tradición', 'Mapas Bogotá · certificate of title'),
      },
      {
        codigo: 'U2',
        texto: t('Distancia a transporte masivo (TransMilenio, Metro)', 'Distance to mass transit (TransMilenio, Metro)'),
        niveles: [t('Más de 1 km', 'Over 1 km'), t('Entre 500 m y 1 km', '500 m to 1 km'), t('A 500 m o menos', '500 m or less')],
        fuente: t('Mapas Bogotá · recorrido', 'Mapas Bogotá · walk-through'),
      },
      {
        codigo: 'U3',
        texto: t('Generadores de demanda a menos de 1 km (universidades, oficinas, hospitales)', 'Demand generators within 1 km (universities, offices, hospitals)'),
        niveles: [t('Ninguno', 'None'), t('Uno', 'One'), t('Varios', 'Several')],
        fuente: t('SNIES · Mapas Bogotá', 'SNIES · Mapas Bogotá'),
      },
      {
        codigo: 'U4',
        texto: t('Frente y visibilidad', 'Frontage and visibility'),
        niveles: [t('Interior o sin frente útil', 'Inner lot or no useful frontage'), t('Frente sobre vía local', 'Frontage on a local street'), t('Esquina o frente sobre eje comercial', 'Corner or frontage on a commercial axis')],
        fuente: t('Visita técnica', 'Site visit'),
      },
    ],
  },
  {
    codigo: 'estructura',
    titulo: t('Estructura', 'Structure'),
    pregunta: t('¿El edificio aguanta un nuevo uso sin una obra inviable?', 'Can the building take a new use without unviable works?'),
    peso: 25,
    criterios: [
      {
        codigo: 'E1', veto: true,
        texto: t('Sin daño estructural severo que haga inviable el reforzamiento', 'No severe structural damage that makes retrofit unviable'),
        niveles: [t('Daño severo o colapso parcial', 'Severe damage or partial collapse'), t('—', '—'), t('Sin daño severo a la vista', 'No visible severe damage')],
        fuente: t('Visita técnica · diagnóstico de ingeniero', 'Site visit · engineer assessment'),
      },
      {
        codigo: 'E2',
        texto: t('Sistema estructural y reforzamiento NSR-10', 'Structural system and NSR-10 retrofit'),
        niveles: [t('Mampostería no reforzada o sin información', 'Unreinforced masonry or no information'), t('Pórticos sin reforzar, reforzables', 'Unretrofitted frames, retrofittable'), t('Ya reforzado o con estudio NSR-10', 'Already retrofitted or with NSR-10 study')],
        fuente: t('Licencias · estudio de vulnerabilidad', 'Permits · vulnerability study'),
      },
      {
        codigo: 'E3',
        texto: t('Altura libre entre pisos', 'Clear floor-to-floor height'),
        niveles: [t('Menos de 2,6 m', 'Under 2.6 m'), t('Entre 2,6 y 3,0 m', '2.6 to 3.0 m'), t('3,0 m o más', '3.0 m or more')],
        fuente: t('Planos · visita técnica', 'Drawings · site visit'),
      },
      {
        codigo: 'E4',
        texto: t('Luz natural y profundidad de planta', 'Daylight and floor depth'),
        niveles: [t('Planta de más de 20 m sin patios', 'Floor over 20 m deep without courtyards'), t('Una fachada o 15 a 20 m de fondo', 'One façade or 15–20 m deep'), t('Dos o más fachadas y fondo de 15 m o menos', 'Two or more façades and 15 m deep or less')],
        fuente: t('Planos · visita técnica', 'Drawings · site visit'),
      },
      {
        codigo: 'E5',
        texto: t('Puntos fijos, evacuación y redes', 'Cores, evacuation and utilities'),
        niveles: [t('Evacuación insuficiente', 'Insufficient evacuation'), t('Escalera suficiente, redes por renovar', 'Enough stairs, utilities to renew'), t('Escalera, ascensor y redes recientes', 'Stairs, elevator and recent utilities')],
        fuente: t('Visita técnica · RETIE', 'Site visit · RETIE'),
      },
    ],
  },
  {
    codigo: 'entorno',
    titulo: t('Entorno', 'Surroundings'),
    pregunta: t('¿La zona ayuda o frena el proyecto?', 'Does the area help or hold back the project?'),
    peso: 15,
    criterios: [
      {
        codigo: 'N1', veto: true,
        texto: t('Sin amenaza alta no mitigable (inundación, remoción en masa)', 'No high, non-mitigable hazard (flooding, landslide)'),
        niveles: [t('Amenaza alta no mitigable', 'High non-mitigable hazard'), t('—', '—'), t('Amenaza baja, media o mitigable', 'Low, medium or mitigable hazard')],
        fuente: t('Mapas del POT 555 · IDIGER', 'POT 555 maps · IDIGER'),
      },
      {
        codigo: 'N2',
        texto: t('Seguridad y actividad de día y de noche', 'Safety and activity by day and night'),
        niveles: [t('Zona deteriorada o insegura', 'Run-down or unsafe area'), t('Activa solo de día', 'Active only by day'), t('Actividad continua', 'Continuous activity')],
        fuente: t('Visita en distintos horarios · Secretaría de Seguridad', 'Visits at different times · Security Secretariat'),
      },
      {
        codigo: 'N3',
        texto: t('Vacancia y dinámica del mercado de la zona', 'Vacancy and market momentum in the area'),
        niveles: [t('Vacancia alta (más del 25 %) y sin demanda', 'High vacancy (over 25%) and no demand'), t('Vacancia media o demanda estable', 'Medium vacancy or stable demand'), t('Vacancia baja o demanda creciente', 'Low vacancy or growing demand')],
        fuente: t('Colliers · Cushman & Wakefield · inmobiliarias', 'Colliers · Cushman & Wakefield · agents'),
      },
      {
        codigo: 'N4',
        texto: t('Inversión pública cercana (Metro, RenoBo, IDU)', 'Nearby public investment (Metro, RenoBo, IDU)'),
        niveles: [t('Ninguna', 'None'), t('Anunciada', 'Announced'), t('En ejecución a menos de 1 km', 'Under way within 1 km')],
        fuente: t('RenoBo · IDU · Empresa Metro', 'RenoBo · IDU · Metro company'),
      },
    ],
  },
  {
    codigo: 'norma',
    titulo: t('Norma', 'Planning rules'),
    pregunta: t('¿La ley deja hacer lo que se quiere?', 'Does the law allow what is intended?'),
    peso: 25,
    criterios: [
      {
        codigo: 'R1', veto: true,
        texto: t('Al menos un uso candidato es permitido o condicionado en el área de actividad', 'At least one candidate use is permitted or conditional in the activity area'),
        niveles: [t('Ningún uso candidato es permitido', 'No candidate use is permitted'), t('—', '—'), t('Al menos uno es permitido o condicionado', 'At least one is permitted or conditional')],
        fuente: t('POT 555 · Mapas Bogotá · concepto de norma', 'POT 555 · Mapas Bogotá · planning opinion'),
      },
      {
        codigo: 'R2',
        texto: t('Tratamiento urbanístico', 'Urban treatment'),
        niveles: [t('Restringe el cambio de uso y la edificabilidad', 'Restricts change of use and buildable area'), t('Conservación con usos amplios', 'Conservation with broad uses'), t('Renovación o consolidación con edificabilidad', 'Renewal or consolidation with buildable area')],
        fuente: t('Mapas Bogotá · POT 555', 'Mapas Bogotá · POT 555'),
      },
      {
        codigo: 'R3',
        texto: t('Condición patrimonial (nivel de intervención BIC)', 'Heritage status (BIC intervention level)'),
        niveles: [t('Nivel 1 · conservación integral: intervención muy limitada', 'Level 1 · full conservation: very limited intervention'), t('Nivel 2 o 3 · conservación tipológica o contextual: permite adecuar el interior', 'Level 2 or 3 · typological or contextual: allows interior adaptation'), t('No es BIC ni está en sector protegido', 'Not listed and not in a protected area')],
        fuente: t('IDPC · SISBIC · Ministerio de Cultura', 'IDPC · SISBIC · Ministry of Culture'),
      },
      {
        codigo: 'R4',
        texto: t('Incentivos para reúso y revitalización', 'Reuse and revitalization incentives'),
        niveles: [t('No aplica a ninguno', 'Not eligible for any'), t('Posible, por confirmar', 'Possible, to confirm'), t('Aplica (Reúsa y Revitaliza, exenciones)', 'Eligible (Reúsa y Revitaliza, exemptions)')],
        fuente: t('RenoBo · Secretaría del Hábitat · Hacienda', 'RenoBo · Habitat Secretariat · Finance'),
      },
      {
        codigo: 'R5',
        texto: t('Trámite que exige el uso más probable', 'Procedure the most likely use requires'),
        niveles: [t('Cambio de uso con autorización del Ministerio de Cultura', 'Change of use with Ministry of Culture approval'), t('Modificación o reforzamiento', 'Modification or retrofit'), t('Reparaciones locativas o adecuación', 'Minor repairs or adaptation')],
        fuente: t('Curaduría urbana', 'Urban curaduría'),
      },
    ],
  },
  {
    codigo: 'historia',
    titulo: t('Historia', 'History'),
    pregunta: t('¿El pasado del inmueble, jurídico y físico, deja avanzar?', "Does the property's legal and physical past let it move forward?"),
    peso: 15,
    criterios: [
      {
        codigo: 'H1', veto: true,
        texto: t('Sin embargos, demandas ni falsa tradición que impidan negociar', 'No attachments, lawsuits or defective title that prevent a deal'),
        niveles: [t('Hay una medida que impide negociar', 'A measure prevents a deal'), t('—', '—'), t('Tradición limpia o con anotaciones que no bloquean', 'Clean title or non-blocking entries')],
        fuente: t('Certificado de tradición · estudio de títulos', 'Certificate of title · title study'),
      },
      {
        codigo: 'H2',
        texto: t('Propiedad y disposición a negociar', 'Ownership and willingness to deal'),
        niveles: [t('Copropiedad dispersa o propiedad horizontal con muchos dueños', 'Scattered co-ownership or condominium with many owners'), t('Varios propietarios de acuerdo', 'Several owners in agreement'), t('Propietario único y dispuesto', 'Single, willing owner')],
        fuente: t('Certificado de tradición · reunión con el propietario', 'Certificate of title · meeting with the owner'),
      },
      {
        codigo: 'H3',
        texto: t('Coherencia entre registro, catastro, licencias y realidad', 'Consistency between registry, cadastre, permits and reality'),
        niveles: [t('Obras sin licencia o diferencias grandes de área', 'Unpermitted works or large area differences'), t('Diferencias menores que se pueden aclarar', 'Minor differences that can be clarified'), t('Todo coincide', 'Everything matches')],
        fuente: t('Cruce de documentos · levantamiento', 'Document cross-check · survey'),
      },
      {
        codigo: 'H4',
        texto: t('Información disponible del edificio (planos, estudios, intervenciones)', 'Available building information (drawings, studies, interventions)'),
        niveles: [t('Ninguna', 'None'), t('Parcial', 'Partial'), t('Planos y estudios completos', 'Complete drawings and studies')],
        fuente: t('Propietario · curaduría · archivo distrital', 'Owner · curaduría · district archive'),
      },
      {
        codigo: 'H5',
        texto: t('Valor arquitectónico e historia aprovechables en el proyecto', 'Architectural value and history the project can use'),
        niveles: [t('Sin elementos de valor', 'No valuable elements'), t('Algunos elementos originales', 'Some original elements'), t('Fachada, escaleras o historia con valor de marca', 'Façade, stairs or history with brand value')],
        fuente: t('Visita técnica · planos originales', 'Site visit · original drawings'),
      },
    ],
  },
]

/** Lectura del potencial total (0-100) */
export const UMBRALES = { alto: 70, medio: 50 }
/** Minimo de criterios graduales evaluados para que el puntaje cuente */
export const COBERTURA_MINIMA = 0.6

export const CRITERIOS_FILTROS = FILTROS.flatMap((f) => f.criterios.map((c) => ({ ...c, filtro: f.codigo })))
