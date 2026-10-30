import type { DocumentoCatalogo, GrupoDocumentos } from '../types'

// Lista de documentos para el analisis de un inmueble (Torna, 27 de octubre de 2026),
// mas dos adiciones de la plataforma marcadas con (+): la autorizacion de datos
// (Ley 1581) y las fotos de la visita.
// "minimo": los cinco con los que ya se puede hacer el tamizaje.

export const GRUPOS_DOCUMENTOS: GrupoDocumentos[] = [
  {
    codigo: 'propietario',
    titulo: { es: 'Al propietario', en: 'From the owner' },
    subgrupos: [
      { codigo: 'propiedad', titulo: { es: 'Propiedad y representación', en: 'Ownership and representation' } },
      { codigo: 'licencias', titulo: { es: 'Licencias y obra', en: 'Permits and works' } },
      { codigo: 'redes', titulo: { es: 'Redes y servicios', en: 'Utilities and services' } },
      { codigo: 'patrimonio', titulo: { es: 'Patrimonio (si es BIC o está en un sector protegido)', en: 'Heritage (if listed or in a protected area)' } },
      { codigo: 'tenencia', titulo: { es: 'Costos de tenencia', en: 'Holding costs' } },
      { codigo: 'historia', titulo: { es: 'Historia y conocimiento del edificio', en: 'History and knowledge of the building' } },
    ],
  },
  {
    codigo: 'publicas',
    titulo: { es: 'En fuentes públicas', en: 'From public sources' },
    subgrupos: [{ codigo: 'publicas', titulo: { es: 'Certificados y consultas', en: 'Certificates and lookups' } }],
  },
  {
    codigo: 'generados',
    titulo: { es: 'Lo que se genera o se contrata', en: 'Produced or commissioned' },
    subgrupos: [{ codigo: 'generados', titulo: { es: 'Estudios propios', en: 'In-house studies' } }],
  },
  {
    codigo: 'mercado',
    titulo: { es: 'Para el estudio de mercado y de zona', en: 'For the market and area study' },
    subgrupos: [{ codigo: 'mercado', titulo: { es: 'Fuentes de mercado', en: 'Market sources' } }],
  },
]

const d = (
  codigo: string,
  grupo: string,
  subgrupo: string,
  disponibilidad: DocumentoCatalogo['disponibilidad'],
  es: string,
  en: string,
  extra: Partial<DocumentoCatalogo> = {}
): DocumentoCatalogo => ({ codigo, grupo, subgrupo, disponibilidad, nombre: { es, en }, ...extra })

export const DOCUMENTOS: DocumentoCatalogo[] = [
  // 1. Al propietario · Propiedad y representacion
  d('P01', 'propietario', 'propiedad', 'no_en_linea', 'Copia de la cédula del propietario', "Copy of the owner's ID"),
  d('P02', 'propietario', 'propiedad', 'en_linea', 'Certificado de existencia y representación legal (menos de 30 días)', 'Certificate of incorporation and legal representation (under 30 days old)', {
    siAplica: true,
    detalle: { es: 'Si es una sociedad. RUES o Cámara de Comercio virtual, pagado.', en: 'If the owner is a company. RUES or the online Chamber of Commerce, paid.' },
  }),
  d('P03', 'propietario', 'propiedad', 'no_en_linea', 'Escrituras de adquisición: la última y las anteriores', 'Deeds of acquisition: the latest and earlier ones', {
    detalle: { es: 'También se piden en la notaría, con el número y la fecha que salen en el certificado de tradición.', en: 'Also available from the notary, with the number and date shown on the certificate of title.' },
  }),
  d('P04', 'propietario', 'propiedad', 'no_en_linea', 'Reglamento de propiedad horizontal, si existe o existió', 'Condominium bylaws, if they exist or existed', { siAplica: true }),
  d('P05', 'propietario', 'propiedad', 'no_en_linea', 'Promesas, contratos de arriendo vigentes, comodatos u otros acuerdos sobre el inmueble', 'Promises, current leases, loans for use or any other agreement on the property'),
  d('P06', 'propietario', 'propiedad', 'no_en_linea', '(+) Autorización de tratamiento de datos firmada por el propietario', '(+) Data processing authorization signed by the owner', {
    detalle: { es: 'Formato de Torna. Necesaria porque el certificado y las escrituras traen nombres y cédulas (Ley 1581 de 2012).', en: "Torna's form. Required because the certificate and deeds include names and ID numbers (Law 1581 of 2012)." },
  }),
  // Licencias y obra
  d('P07', 'propietario', 'licencias', 'parcial', 'Licencias de construcción anteriores con sus planos sellados', 'Previous building permits with their stamped drawings', {
    minimo: true,
    detalle: { es: 'Arquitectónicos, estructurales y de elementos no estructurales. Las copias se piden en el archivo de la curaduría; las muy antiguas, en archivos distritales.', en: 'Architectural, structural and non-structural. Copies are requested from the curaduría archive; very old ones from district archives.' },
  }),
  d('P08', 'propietario', 'licencias', 'no_en_linea', 'Estudio de suelos y memorias de cálculo estructural', 'Soil study and structural calculation reports'),
  d('P09', 'propietario', 'licencias', 'no_en_linea', 'Estudio de vulnerabilidad sísmica o de reforzamiento (NSR-10), si se hizo', 'Seismic vulnerability or retrofit study (NSR-10), if done'),
  d('P10', 'propietario', 'licencias', 'no_en_linea', 'Certificado de permiso de ocupación de la última obra', 'Occupancy permit for the latest works'),
  d('P11', 'propietario', 'licencias', 'no_en_linea', 'Declaración final del impuesto de delineación urbana', 'Final urban delineation tax return'),
  d('P12', 'propietario', 'licencias', 'no_en_linea', 'Planos récord o «as built», si existen', 'Record or as-built drawings, if any'),
  // Redes y servicios
  d('P13', 'propietario', 'redes', 'no_en_linea', 'Certificación RETIE y planos eléctricos', 'RETIE certification and electrical drawings'),
  d('P14', 'propietario', 'redes', 'no_en_linea', 'Planos hidrosanitarios y de gas', 'Plumbing and gas drawings'),
  d('P15', 'propietario', 'redes', 'no_en_linea', 'Últimas facturas de servicios públicos (energía, agua, gas)', 'Latest utility bills (power, water, gas)', {
    detalle: { es: 'Muestran el número de cuenta, el estrato y la capacidad instalada.', en: 'They show the account number, the stratum and the installed capacity.' },
  }),
  d('P16', 'propietario', 'redes', 'no_en_linea', 'Certificados de ascensor, si tiene', 'Elevator certificates, if any', { siAplica: true }),
  // Patrimonio
  d('P17', 'propietario', 'patrimonio', 'parcial', 'Resoluciones del IDPC o del Ministerio de Cultura', 'IDPC or Ministry of Culture resolutions', {
    siAplica: true,
    detalle: { es: 'A veces están publicadas; si no, se piden por derecho de petición.', en: 'Sometimes published; otherwise requested through a formal petition.' },
  }),
  d('P18', 'propietario', 'patrimonio', 'parcial', 'Fichas de valoración y planos aprobados por patrimonio', 'Heritage valuation sheets and approved drawings', {
    siAplica: true,
    detalle: { es: 'Las fichas se consultan por código catastral en el SISBIC del IDPC; los planos aprobados los tiene el propietario.', en: 'Sheets are looked up by cadastral code in the IDPC SISBIC; the owner holds the approved drawings.' },
  }),
  // Costos de tenencia
  d('P19', 'propietario', 'tenencia', 'en_linea', 'Recibos de impuesto predial de los últimos 5 años y paz y salvo', 'Property tax receipts for the last 5 years and clearance certificate', {
    detalle: { es: 'Oficina Virtual de la Secretaría de Hacienda, con el CHIP.', en: "Finance Secretariat's online office, with the CHIP." },
  }),
  d('P20', 'propietario', 'tenencia', 'en_linea', 'Paz y salvo o estado de cuenta de valorización (IDU)', 'Betterment levy clearance or statement (IDU)'),
  d('P21', 'propietario', 'tenencia', 'no_en_linea', 'Cuenta de cobro de administración, si aplica', 'Condominium fee statement, if any', { siAplica: true }),
  d('P22', 'propietario', 'tenencia', 'no_en_linea', 'Póliza de seguro del inmueble, si tiene', 'Property insurance policy, if any', { siAplica: true }),
  // Historia
  d('P23', 'propietario', 'historia', 'no_en_linea', 'Planos originales, fotos antiguas, publicaciones, avalúos anteriores y estudios previos', 'Original drawings, old photos, publications, earlier appraisals and previous studies'),
  d('P24', 'propietario', 'historia', 'no_en_linea', 'Lista de intervenciones hechas con fechas', 'List of past interventions with dates', {
    detalle: { es: 'Remodelaciones, cambios de fachada, reparaciones grandes.', en: 'Remodeling, façade changes, major repairs.' },
  }),
  d('P25', 'propietario', 'historia', 'no_en_linea', 'Lo que el dueño sabe de humedades, daños, fallas o reclamos de vecinos', 'What the owner knows about damp, damage, failures or neighbor complaints'),

  // 2. En fuentes publicas
  d('F01', 'publicas', 'publicas', 'en_linea', 'Certificado de tradición y libertad actualizado', 'Up-to-date certificate of title', {
    minimo: true,
    detalle: { es: 'certificados.supernotariado.gov.co, se paga con PSE y sale al instante con la matrícula. Sacarlo uno mismo aunque el dueño lo traiga.', en: 'certificados.supernotariado.gov.co; paid online and issued instantly with the registration number. Get it yourself even if the owner brings one.' },
  }),
  d('F02', 'publicas', 'publicas', 'en_linea', 'Certificados de tradición de las matrículas derivadas', 'Certificates of title for derived registration numbers', {
    siAplica: true,
    detalle: { es: 'Si hubo propiedad horizontal o segregaciones.', en: 'If there was a condominium regime or subdivisions.' },
  }),
  d('F03', 'publicas', 'publicas', 'en_linea', 'Certificado catastral: área de terreno, área construida, uso, CHIP y avalúo', 'Cadastral certificate: lot area, built area, use, CHIP and assessed value', {
    minimo: true,
    detalle: { es: 'Catastro Bogotá en línea, con registro.', en: 'Bogotá Cadastre online, with registration.' },
  }),
  d('F04', 'publicas', 'publicas', 'en_linea', 'Consulta de norma urbana en Mapas Bogotá', 'Urban planning lookup in Mapas Bogotá', {
    minimo: true,
    detalle: { es: 'Tratamiento, área de actividad, UPL, usos, edificabilidad, BIC, afectaciones y plusvalía. Es gratis.', en: 'Treatment, activity area, UPL, uses, buildable area, heritage, easements and land value capture. Free.' },
  }),
  d('F05', 'publicas', 'publicas', 'parcial', 'Concepto de norma o consulta formal ante Planeación o una curaduría', 'Formal planning opinion from the Planning Secretariat or a curaduría', {
    siAplica: true,
    detalle: { es: 'Si el uso que se quiere no es claro. Se radica en línea; la respuesta tarda y algunos trámites tienen costo.', en: 'If the intended use is unclear. Filed online; the answer takes time and some procedures have a fee.' },
  }),
  d('F06', 'publicas', 'publicas', 'parcial', 'Consulta de la condición patrimonial y del PEMP ante el IDPC o el Ministerio de Cultura', 'Heritage status and special management plan (PEMP) lookup with the IDPC or the Ministry of Culture'),
  d('F07', 'publicas', 'publicas', 'en_linea', 'Consulta de plusvalía y de afectaciones viales o de reserva', 'Land value capture and road or reserve easement lookup', {
    detalle: { es: 'Mapas Bogotá, Secretaría de Hacienda, IDU.', en: 'Mapas Bogotá, Finance Secretariat, IDU.' },
  }),
  d('F08', 'publicas', 'publicas', 'parcial', 'Resoluciones o actos administrativos que mencione el certificado de tradición', 'Resolutions or administrative acts mentioned in the certificate of title', {
    siAplica: true,
    detalle: { es: 'Expropiaciones, ofertas de compra, embargos. Se piden a la entidad que los expidió.', en: 'Expropriations, purchase offers, attachments. Requested from the issuing entity.' },
  }),

  // 3. Lo que se genera o se contrata
  d('G01', 'generados', 'generados', 'no_en_linea', 'Visita técnica con registro fotográfico', 'Technical site visit with photo record', {
    minimo: true,
    detalle: { es: 'Se llena en la pestaña Visita técnica de esta ficha.', en: 'Filled in on the Site visit tab of this profile.' },
  }),
  d('G02', 'generados', 'generados', 'no_en_linea', 'Levantamiento arquitectónico y topográfico', 'Architectural and topographic survey', {
    siAplica: true,
    detalle: { es: 'Si no hay planos confiables o las áreas no cuadran.', en: 'If there are no reliable drawings or the areas do not match.' },
  }),
  d('G03', 'generados', 'generados', 'no_en_linea', 'Diagnóstico estructural preliminar por un ingeniero', 'Preliminary structural assessment by an engineer'),
  d('G04', 'generados', 'generados', 'no_en_linea', 'Estudio de títulos por un abogado', 'Title study by a lawyer', {
    detalle: { es: 'Sobre todo si el certificado tiene medidas cautelares o anotaciones raras.', en: 'Especially if the certificate shows precautionary measures or unusual entries.' },
  }),
  d('G05', 'generados', 'generados', 'no_en_linea', 'Avalúo comercial', 'Commercial appraisal', {
    siAplica: true,
    detalle: { es: 'Si se va a negociar o a presentar el proyecto a inversionistas.', en: 'If the project will be negotiated or presented to investors.' },
  }),

  // 4. Mercado y zona
  d('M01', 'mercado', 'mercado', 'en_linea', 'Comparables de venta y arriendo por uso', 'Sale and rental comparables by use', {
    detalle: { es: 'Fincaraíz, Metrocuadrado, Ciencuadras y consulta a inmobiliarias de la zona.', en: 'Fincaraíz, Metrocuadrado, Ciencuadras and local real estate agents.' },
  }),
  d('M02', 'mercado', 'mercado', 'en_linea', 'Informes de vacancia y precios de oficinas', 'Office vacancy and price reports', {
    detalle: { es: 'Colliers, Cushman & Wakefield; generalmente gratis.', en: 'Colliers, Cushman & Wakefield; usually free.' },
  }),
  d('M03', 'mercado', 'mercado', 'parcial', 'Datos de mercado más finos', 'Finer market data', {
    detalle: { es: 'Galería Inmobiliaria, La Lonja, Coordenada Urbana de Camacol; de pago o por suscripción.', en: 'Galería Inmobiliaria, La Lonja, Coordenada Urbana (Camacol); paid or by subscription.' },
  }),
  d('M04', 'mercado', 'mercado', 'en_linea', 'Datos de población y hogares', 'Population and household data', {
    detalle: { es: 'DANE, Encuesta Multipropósito y Datos Abiertos de Bogotá.', en: 'DANE, Multipurpose Survey and Bogotá Open Data.' },
  }),
  d('M05', 'mercado', 'mercado', 'en_linea', 'Generadores de demanda cercanos', 'Nearby demand generators', {
    detalle: { es: 'Universidades con su matrícula en el SNIES, oficinas, hospitales.', en: 'Universities with SNIES enrollment, offices, hospitals.' },
  }),
  d('M06', 'mercado', 'mercado', 'en_linea', 'Proyectos futuros de la zona', 'Upcoming projects in the area', {
    detalle: { es: 'Metro, RenoBo, IDU.', en: 'Metro, RenoBo, IDU.' },
  }),
]

export const DOCUMENTOS_MINIMO = DOCUMENTOS.filter((x) => x.minimo).map((x) => x.codigo)

export const documentoPorCodigo = (codigo: string) => DOCUMENTOS.find((x) => x.codigo === codigo)
