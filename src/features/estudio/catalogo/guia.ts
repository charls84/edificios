import type { BloqueGuia, ItemGuia } from '../types'

// Checklist de la "Guia de analisis de mayor y mejor uso" (Torna, v1.0, 27-oct-2026).
// Bloques A-F con sus items; el bloque G es la matriz de usos (ver usos.ts).
// "CV" es la prueba rapida de conversion: cinco vetos fisicos que descartan de una.

export const BLOQUES_GUIA: BloqueGuia[] = [
  { codigo: 'A', prueba: 'legal', titulo: { es: 'Papeles del predio', en: 'Property papers' }, pregunta: { es: '¿El inmueble está limpio y en orden?', en: 'Is the property clean and in order?' } },
  { codigo: 'B', prueba: 'legal', titulo: { es: 'Norma urbana', en: 'Planning rules' }, pregunta: { es: '¿Qué usos e intensidades permite la ley?', en: 'Which uses and intensities does the law allow?' } },
  { codigo: 'C', prueba: 'fisica', titulo: { es: 'El edificio y el lote', en: 'The building and the lot' }, pregunta: { es: '¿Este uso cabe sin una obra que lo vuelva inviable?', en: 'Does this use fit without works that make it unviable?' } },
  { codigo: 'CV', prueba: 'fisica', titulo: { es: 'Prueba rápida de conversión', en: 'Quick conversion test' }, pregunta: { es: 'Filtros que descartan de una', en: 'Filters that rule out at once' } },
  { codigo: 'D', prueba: 'financiera', titulo: { es: 'La zona', en: 'The area' }, pregunta: { es: '¿Quién vive, trabaja y pasa por aquí?', en: 'Who lives, works and passes through here?' } },
  { codigo: 'E', prueba: 'financiera', titulo: { es: 'Mercado de cada uso candidato', en: 'Market for each candidate use' }, pregunta: { es: '¿Hay demanda y a qué precio?', en: 'Is there demand and at what price?' } },
  { codigo: 'F', prueba: 'financiera', titulo: { es: 'Números de cada uso', en: 'Numbers for each use' }, pregunta: { es: '¿El ingreso paga la inversión?', en: 'Does the income pay for the investment?' } },
]

const i = (codigo: string, es: string, en: string, notaEs: string, notaEn: string, bloqueante = false): ItemGuia => ({
  codigo,
  bloque: codigo.replace(/\d+$/, ''),
  texto: { es, en },
  nota: { es: notaEs, en: notaEn },
  bloqueante,
})

export const ITEMS_GUIA: ItemGuia[] = [
  // A · Papeles del predio
  i('A1', 'Certificado de tradición reciente: propietarios, hipotecas, embargos, medidas cautelares, propiedad horizontal', 'Recent certificate of title: owners, mortgages, attachments, precautionary measures, condominium regime', 'Superintendencia de Notariado y Registro (ORIP)', 'Superintendency of Notaries and Registry (ORIP)', true),
  i('A2', 'Boletín catastral: área de terreno, área construida, uso y destino, avalúo catastral', 'Cadastral bulletin: lot area, built area, use and purpose, assessed value', 'Catastro Bogotá (UAECD)', 'Bogotá Cadastre (UAECD)'),
  i('A3', 'Escrituras y reglamento de propiedad horizontal si existe', 'Deeds and condominium bylaws if any', 'Propietario · notarías', 'Owner · notaries'),
  i('A4', 'Licencias anteriores, planos aprobados y permiso de ocupación', 'Previous permits, approved drawings and occupancy permit', 'Propietario · curadurías urbanas', 'Owner · urban curadurías'),
  i('A5', 'Plusvalía, valorización y predial al día', 'Land value capture, betterment levy and property tax up to date', 'Secretaría de Hacienda · IDU', 'Finance Secretariat · IDU'),
  i('A6', 'Servidumbres y afectaciones viales o de servicios públicos', 'Easements and road or utility reservations', 'Certificado de tradición · Mapas Bogotá', 'Certificate of title · Mapas Bogotá', true),
  i('A7', 'Coincidencia de áreas y linderos entre registro, catastro y la realidad', 'Areas and boundaries match between registry, cadastre and reality', 'Cruce de documentos · topógrafo', 'Document cross-check · surveyor'),

  // B · Norma urbana
  i('B1', 'POT vigente (Bogotá: Decreto 555 de 2021) y la unidad de planeamiento que aplica (UPL)', 'Current POT (Bogotá: Decree 555 of 2021) and the applicable planning unit (UPL)', 'Secretaría Distrital de Planeación', 'District Planning Secretariat'),
  i('B2', 'Tratamiento urbanístico (conservación, renovación, consolidación…) y área de actividad', 'Urban treatment (conservation, renewal, consolidation…) and activity area', 'Mapas Bogotá · concepto de norma', 'Mapas Bogotá · planning opinion'),
  i('B3', 'Usos permitidos, condicionados y prohibidos, con sus condiciones (escala, horarios, mitigación)', 'Permitted, conditional and prohibited uses, with their conditions (scale, hours, mitigation)', 'POT · concepto de norma', 'POT · planning opinion', true),
  i('B4', 'Edificabilidad: índices de ocupación y construcción, alturas, aislamientos, voladizos', 'Buildable area: occupancy and construction indexes, heights, setbacks, overhangs', 'POT · fichas normativas', 'POT · planning sheets'),
  i('B5', 'Patrimonio: ¿es Bien de Interés Cultural? Categoría, nivel de intervención, PEMP si aplica', 'Heritage: is it listed (BIC)? Category, intervention level, PEMP if applicable', 'IDPC · Ministerio de Cultura', 'IDPC · Ministry of Culture', true),
  i('B6', 'Estacionamientos exigidos para cada uso', 'Parking required for each use', 'POT', 'POT'),
  i('B7', 'Cargas y obligaciones urbanísticas por cambio de uso o mayor edificabilidad', 'Urban obligations for change of use or added buildable area', 'POT · curaduría', 'POT · curaduría'),
  i('B8', 'Incentivos para reúso y revitalización (por ejemplo, Reúsa y Revitaliza de RenoBo)', 'Reuse and revitalization incentives (e.g., RenoBo Reúsa y Revitaliza)', 'RenoBo · Secretaría del Hábitat', 'RenoBo · Habitat Secretariat'),
  i('B9', 'Tipo de trámite que requiere cada uso: reparaciones locativas, adecuación, modificación, reforzamiento o cambio de uso', 'Procedure each use requires: minor repairs, adaptation, modification, retrofit or change of use', 'Curaduría urbana', 'Urban curaduría'),

  // C · El edificio y el lote
  i('C1', 'Estructura y vulnerabilidad sísmica frente a la NSR-10. ¿Ya está reforzada? ¿Qué exige el nuevo uso en cargas?', 'Structure and seismic vulnerability under NSR-10. Already retrofitted? What loads does the new use require?', 'Es el costo más alto y más incierto de una rehabilitación', 'The highest and most uncertain cost of a rehabilitation', true),
  i('C2', 'Estudio de suelos y cimentación', 'Soil study and foundations', 'Condiciona el reforzamiento y cualquier ampliación', 'Conditions the retrofit and any extension'),
  i('C3', 'Altura libre entre pisos', 'Clear height between floors', 'Define si caben cielos rasos, ductos y redes nuevas', 'Defines whether ceilings, ducts and new utilities fit'),
  i('C4', 'Modulación de columnas y planta libre o muros de carga', 'Column grid and open plan or load-bearing walls', 'Define qué tan flexible es la distribución', 'Defines how flexible the layout is'),
  i('C5', 'Profundidad de planta y número de fachadas con ventanas', 'Floor depth and number of façades with windows', 'Para vivienda, una planta muy honda deja espacios sin luz ni ventilación natural', 'For housing, a very deep floor leaves spaces without daylight or natural ventilation'),
  i('C6', 'Puntos fijos: escaleras, ascensor y rutas de evacuación (NSR-10, títulos J y K)', 'Cores: stairs, elevator and evacuation routes (NSR-10, titles J and K)', 'Cada uso exige distintas salidas y protección contra incendio', 'Each use requires different exits and fire protection'),
  i('C7', 'Dónde pueden ir baños y cocinas: bajantes, pendientes y ductos', 'Where bathrooms and kitchens can go: downpipes, slopes and ducts', 'Es la restricción clave para pasar de oficina a vivienda', 'The key constraint for office-to-housing conversion'),
  i('C8', 'Redes: eléctrica (capacidad y RETIE), hidrosanitaria, gas, voz y datos', 'Utilities: electrical (capacity and RETIE), plumbing, gas, voice and data', 'Redes nuevas ahorran meses y dinero', 'New utilities save months and money'),
  i('C9', 'Fachada y cubierta: estado, humedades, impermeabilización', 'Façade and roof: condition, damp, waterproofing', 'Afectan la imagen comercial y el costo de mantenimiento', 'Affect the commercial image and maintenance cost'),
  i('C10', 'Accesibilidad para personas con movilidad reducida', 'Accessibility for people with reduced mobility', 'Es obligatoria y puede exigir ascensor o rampas', 'Mandatory; may require an elevator or ramps'),
  i('C11', 'Áreas brutas y netas por piso (área arrendable o vendible real)', 'Gross and net areas per floor (real leasable or sellable area)', 'Los ingresos se calculan sobre el área neta, no sobre la bruta', 'Income is computed on net area, not gross'),
  i('C12', 'Elementos valiosos a conservar: fachada, escaleras, pisos, carpinterías', 'Valuable elements to keep: façade, stairs, floors, joinery', 'Son el sello del proyecto y a veces una obligación patrimonial', 'They are the signature of the project and sometimes a heritage obligation'),
  i('C13', 'Lote: forma, frente, topografía, acceso vehicular y de carga', 'Lot: shape, frontage, topography, vehicle and loading access', 'Limita usos como hotel, comercio grande o bodega', 'Limits uses such as hotel, large retail or warehouse'),

  // CV · Prueba rapida de conversion (vetos)
  i('CV1', '¿La estructura se puede reforzar a un costo razonable?', 'Can the structure be retrofitted at a reasonable cost?', 'Si no, el edificio se descarta', 'If not, the building is ruled out', true),
  i('CV2', '¿Llega luz natural a donde iría cada unidad?', 'Does daylight reach where each unit would go?', 'Clave para vivienda y oficinas', 'Key for housing and offices', true),
  i('CV3', '¿Hay cómo bajar las aguas de baños y cocinas nuevos?', 'Is there a way to drain new bathrooms and kitchens?', 'Clave para pasar a vivienda', 'Key for conversion to housing', true),
  i('CV4', '¿Las salidas de evacuación alcanzan para el número de personas del nuevo uso?', 'Are there enough evacuation exits for the occupancy of the new use?', 'NSR-10, títulos J y K', 'NSR-10, titles J and K', true),
  i('CV5', '¿La norma patrimonial permite las aperturas o los cambios que se necesitan?', 'Do heritage rules allow the openings or changes needed?', 'IDPC · PEMP', 'IDPC · PEMP', true),
  i('CV6', '¿El área neta da un número de unidades que justifique la inversión?', 'Does the net area yield enough units to justify the investment?', 'Se confirma con los números del bloque F', 'Confirmed with the block F numbers'),

  // D · La zona
  i('D1', 'Población: edades, tipo de hogares (unipersonales, familias), ingresos', 'Population: ages, household types (single-person, families), income', 'DANE (censo, Encuesta Multipropósito)', 'DANE (census, Multipurpose Survey)'),
  i('D2', 'Flujos: peatones, transporte público, accesos, horarios de actividad', 'Flows: pedestrians, public transport, access, activity hours', 'Visita en distintos horarios · Secretaría de Movilidad', 'Visits at different times · Mobility Secretariat'),
  i('D3', 'Generadores de demanda: universidades (matrícula), oficinas, hospitales, comercio', 'Demand generators: universities (enrollment), offices, hospitals, retail', 'SNIES · Mapas Bogotá', 'SNIES · Mapas Bogotá'),
  i('D4', 'Usos actuales en la manzana y el entorno, y qué hace falta', 'Current uses on the block and surroundings, and what is missing', 'Recorrido · Catastro · Mapas Bogotá', 'Walk-through · Cadastre · Mapas Bogotá'),
  i('D5', 'Seguridad y percepción de la zona de día y de noche', 'Safety and perception of the area by day and night', 'Secretaría de Seguridad · visita', 'Security Secretariat · site visit'),
  i('D6', 'Proyectos futuros: metro, renovación urbana, espacio público', 'Upcoming projects: metro, urban renewal, public space', 'RenoBo · IDU · Empresa Metro', 'RenoBo · IDU · Metro company'),

  // E · Mercado de cada uso candidato
  i('E1', 'Oferta competidora: inmuebles similares, inventario disponible, vacancia', 'Competing supply: similar properties, available inventory, vacancy', 'Fincaraíz · Metrocuadrado · Colliers · Cushman & Wakefield', 'Fincaraíz · Metrocuadrado · Colliers · Cushman & Wakefield'),
  i('E2', 'Precios o cánones por m² de comparables (mínimo 5 a 10 por uso)', 'Prices or rents per m² of comparables (at least 5 to 10 per use)', 'Portales · inmobiliarias · Galería Inmobiliaria · La Lonja', 'Portals · agents · Galería Inmobiliaria · La Lonja'),
  i('E3', 'Velocidad: tiempo de colocación o de venta, absorción', 'Speed: time to lease or sell, absorption', 'Inmobiliarias de la zona · Coordenada Urbana (Camacol)', 'Local agents · Coordenada Urbana (Camacol)'),
  i('E4', 'Cliente objetivo: quién es, cuántos hay, cuánto paga, qué necesita', 'Target customer: who, how many, how much they pay, what they need', 'Entrevistas · encuestas · datos de la zona', 'Interviews · surveys · area data'),
  i('E5', 'Proyectos en camino que van a competir', 'Upcoming projects that will compete', 'Coordenada Urbana · licencias recientes', 'Coordenada Urbana · recent permits'),

  // F · Numeros de cada uso
  i('F1', 'Costo de adecuación: obra, reforzamiento, diseños, licencias, honorarios, imprevistos', 'Adaptation cost: works, retrofit, design, permits, fees, contingencies', 'Cotizaciones · costos por m² de referencia', 'Quotes · reference costs per m²'),
  i('F2', 'Ingreso: canon o precio × área neta × ocupación esperada', 'Income: rent or price × net area × expected occupancy', 'Con vacancia realista, nunca al 100 %', 'With realistic vacancy, never 100%'),
  i('F3', 'Gastos: predial, administración, mantenimiento, seguros, comisiones', 'Expenses: property tax, management, maintenance, insurance, commissions', 'Los paga el propietario en arriendo', 'Paid by the owner when leasing'),
  i('F4', 'Tiempos: licencia, obra y colocación (meses sin ingreso)', 'Timing: permit, works and lease-up (months without income)', 'El tiempo cuesta', 'Time costs money'),
  i('F5', 'Indicadores: rentabilidad del arriendo, recuperación, TIR, VPN', 'Indicators: rental yield, payback, IRR, NPV', 'Comparar contra una tasa mínima', 'Compare against a hurdle rate'),
  i('F6', 'Sensibilidades: canon −10 %, obra +20 %, colocación más lenta', 'Sensitivities: rent −10%, works +20%, slower lease-up', 'Muestra qué uso es más frágil', 'Shows which use is most fragile'),
]

export const itemsDelBloque = (bloque: string) => ITEMS_GUIA.filter((x) => x.bloque === bloque)
export const bloquesDePrueba = (prueba: BloqueGuia['prueba']) => BLOQUES_GUIA.filter((b) => b.prueba === prueba)
