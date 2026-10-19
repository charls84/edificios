# BUSINESS_LOGIC.md — Plataforma de inteligencia de edificios (Bogotá)

> Documento de necesidad para el equipo de desarrollo.
> Versión 0.1 · 2026-10-19 · Preparado por DOUX.WORK
> Estado: **borrador para validar con el cliente** (ver sección 12, preguntas abiertas).

---

## 1. Problema de negocio

El cliente está montando una empresa que rehabilita edificaciones antiguas desocupadas en Bogotá (proyecto real que también es su tesis). Ya tiene contacto con dos propietarios de varios edificios en esa condición, y ellos le preguntan: *"¿cuál es el plan y cómo los vas a activar?"*.

Para responder, hoy tiene que buscar a mano la información de cada edificio en 6 a 8 portales distintos: catastro, norma del POT, patrimonio, PEMP, riesgo, licencias, propiedad e incentivos. Cada portal usa su propio identificador y su propio formato.

**Costo del problema:** cada análisis de prefactibilidad toma días y depende de una persona que sepa dónde buscar. Eso limita cuántos edificios se pueden evaluar y retrasa la respuesta al propietario.

**Contexto de mercado que lo hace urgente:**
- RenoBo estima más de 500 edificios con potencial de reúso solo en el centro de Bogotá, y unas 6.500 soluciones de vivienda posibles (programa *Reúsa y Revitaliza el Centro*).
- El Acuerdo "Ciudad Inteligente" (2026) propone exención de predial para renovación urbana y de impuesto de delineación para adecuación o reforzamiento en Centro Histórico y Teusaquillo. *Falta confirmar el texto final aprobado.*

## 2. Solución

Una **herramienta web de uso interno** (no es un producto para vender) que, con una dirección o un CHIP, arma la **ficha del edificio**: reúne los datos públicos disponibles, lee los documentos que se carguen y asigna un **puntaje de potencial de rehabilitación**.

**Qué NO reemplaza:** el concepto técnico del IDPC, la certificación de riesgo del IDIGER, la visita estructural (NSR-10) ni la licencia ante curaduría. La herramienta sirve para llegar a esas instancias con la tarea hecha y descartar rápido los edificios inviables.

### Flujo principal (happy path)

1. El analista busca un edificio por dirección, CHIP o clic en el mapa.
2. El sistema identifica el predio y trae los datos de catastro, POT, patrimonio/PEMP, amenaza, licencias e incentivos.
3. El analista carga el certificado de tradición y libertad (PDF) y otros documentos. La IA extrae los campos clave con cita a la página.
4. El analista revisa y confirma los campos marcados "por validar" y agrega notas de la visita.
5. El sistema calcula el puntaje y ubica el edificio en el portafolio.
6. El analista exporta la ficha en PDF para presentarla al propietario.

## 3. Usuario objetivo

- **Usuario principal:** el fundador y su equipo de análisis (estimado: 1 a 5 personas).
- **Usuario secundario (solo lectura, vía PDF):** propietarios de los edificios.
- No hay registro público ni usuarios externos en la plataforma.

## 4. Estudio de mercado: referentes

**Conclusión:** el modelo a seguir es LandInsight (Reino Unido) o Archistar (Australia): mapa + ficha del predio + restricciones + alertas. Ninguno opera en Colombia. Lo local se limita a consulta normativa o a portales oficiales sin cruce de datos. Como la herramienta es de uso interno, estos referentes no son competencia: muestran qué funciones ya probaron su valor.

| Referente | País | Qué hace | Precio de referencia | Qué tomamos |
|---|---|---|---|---|
| [LandInsight (LandTech)](https://land.tech/landinsight-pricing-plans) | Reino Unido | Busca suelo y edificios cruzando propiedad, licencias, plan local y restricciones; alertas | £2.500–6.000 por licencia al año ([G-Cloud](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/595409603965228)) | Ficha única + filtros + alertas |
| [Archistar](https://www.capterra.com/p/213621/Archistar/) | Australia | Prefactibilidad con IA y volúmenes 3D generativos | Desde ≈ USD 95/mes | Cálculo preliminar de m² |
| [Gridics](https://pr1.gridics.com/zoning-data-api/) | EE. UU. | Capacidad edificable por lote (altura, densidad, retiros), 3D y API | No público | Traducir la norma a números |
| [Zoneomics](https://www.zoneomics.com/blog/2025-recap-zoneomics-advancing-zoning-intelligence) | EE. UU., Canadá, Australia | Norma digitalizada de más de 20.000 ciudades, reportes por predio | No público | Reporte normativo descargable |
| [Regrid](https://regrid.com/pricing) | EE. UU., Canadá | Datos de predios por API; servidor MCP para agentes de IA | Por registros consultados | Capa de datos + IA conversacional |
| [Searchland](https://hmlandregistry.blog.gov.uk/2022/08/18/how-searchland-is-using-our-data-to-help-land-developers/) | Reino Unido | Cruza el registro de propiedad con licencias y restricciones | No público | Folio de matrícula como llave |
| [UrbanGPT](https://www.urbangpt.com.co/) | Colombia | Consulta de POT y norma urbana con IA (mapas vistos solo de Villavicencio) | No verificado | Competidor local más cercano; confirmar cobertura en Bogotá |
| SINUPOT, Mapas Bogotá, [Planoteca SDP](https://bogota.gov.co/mi-ciudad/planeacion/planoteca-digital-de-bogota-con-1670-planos-urbanisticos-disponibles) | Colombia | Portales oficiales separados, sin cruce ni análisis | Gratis | Son las fuentes, no la competencia |

*Los precios vienen de listados de terceros (Capterra, G-Cloud). Hay que validarlos antes de citarlos en la tesis.*

## 5. Fuentes de datos (insumo de la Fase 0)

| Pregunta sobre el edificio | Fuente oficial | Acceso | Automatizable |
|---|---|---|---|
| Ubicación, área, avalúo, CHIP | Catastro Bogotá (UAECD) / IDECA / Mapas Bogotá | Datos abiertos y servicios GIS gratuitos (licencia abierta, base 2024) | Sí |
| Norma aplicable (uso, tratamiento, edificabilidad) | [POT Decreto 555 de 2021](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=119582) ([capas en datos abiertos](https://datosabiertos.bogota.gov.co/dataset/pot-decreto-555-de-2021-bogota-d-c)) + SINUPOT (SDP) | Capas abiertas; SINUPOT es consulta web | Parcial: capas sí, interpretación con IA + revisión humana |
| Patrimonio (BIC, sector de interés cultural) | IDPC + [capa BIC de Catastro](https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/recreaciondeporte/bienesinterescultural/MapServer/layers); BIC nacionales: MinCultura | Capa GIS pública; concepto técnico por solicitud | Parcial: detección sí, concepto no |
| PEMP Centro Histórico y nivel de intervención | Res. 088 de 2021, mod. Res. 092 de 2023; capas IDPC en datos abiertos | Datos abiertos | Sí |
| Licencias previas | SINUPOT, módulo de licencias de curadurías (≈ 55.000 registros) | Consulta web, reporte PDF | Parcial |
| Propietario, embargos, hipotecas | Certificado de tradición y libertad (SNR) | COP 23.000 por certificado electrónico (2026) | No: se compra, se carga el PDF y la IA lo lee |
| Amenaza y riesgo | Mapas de amenaza del POT 555 + certificación IDIGER | Capas abiertas; certificación por solicitud | Parcial |
| Incentivos | RenoBo, Acuerdo "Ciudad Inteligente", Secretaría de Hacienda | Normas publicadas | Sí, como reglas que se mantienen a mano |
| Estado estructural | Visita técnica (NSR-10) | Trabajo de campo | No: solo se registra el resultado |

> **Pendiente técnico:** en la investigación no se pudieron abrir los servicios GIS de Catastro ni la API de Datos Abiertos (bloqueo de red del entorno). La disponibilidad real de cada capa, sus campos y la llave de cruce se confirman en la Fase 0.

## 6. Requisitos funcionales

### Fase 1 — MVP (ficha del edificio)

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF-01 | Buscar predio por dirección, CHIP o clic en el mapa | Devuelve el predio correcto en los edificios de prueba de la Fase 0 |
| RF-02 | Ficha del edificio con secciones: identificación catastral, norma POT, patrimonio/PEMP, amenaza, licencias, incentivos, propiedad, estado físico | Cada dato muestra valor, **fuente, fecha de consulta y enlace** |
| RF-03 | Cargar PDF (certificado de tradición, concepto IDPC, licencia) y extraer campos con IA | Cada campo extraído cita la página del documento y queda en estado "por validar" |
| RF-04 | Validación humana de campos extraídos | Solo los campos confirmados cuentan para el puntaje y salen en el PDF |
| RF-05 | Notas y fotos de visita por edificio | Se guardan con fecha y autor |
| RF-06 | Exportar ficha a PDF para el propietario | El PDF incluye fuentes y la fecha de corte; excluye datos personales no necesarios |
| RF-07 | Portafolio: lista y mapa de edificios con etapa | Etapas: Identificado · En análisis · Presentado · Descartado · En intervención |
| RF-08 | Acceso con usuario y contraseña para el equipo | Sin registro público; el administrador invita usuarios |

### Fase 2 — Asistente y puntaje

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF-09 | Asistente normativo en lenguaje natural sobre POT 555, PEMP y acuerdos | Toda respuesta cita artículo y documento; si no encuentra base, lo dice |
| RF-10 | Puntaje de potencial configurable (norma, patrimonio, riesgo, incentivos, estado) | Pesos editables; el puntaje muestra cómo se calculó |
| RF-11 | Tablero comparativo de candidatos | Ordena y filtra por puntaje, zona y etapa |

### Fase 3 — Cabida preliminar

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF-12 | Cálculo aproximado de m² y unidades según la norma | Se marca como "indicativo" y muestra los supuestos usados |

## 7. Arquitectura de datos

**Llave principal:** CHIP del predio. Cada dato guarda su fuente y su fecha.

| Tabla | Propósito | Campos clave |
|---|---|---|
| `buildings` | Edificio / predio | id, chip, direccion, matricula_inmobiliaria, geom (PostGIS), etapa, puntaje |
| `data_sources` | Catálogo de fuentes | id, nombre, entidad, url, licencia, tipo (api / descarga / manual) |
| `data_points` | Cada dato de la ficha | id, building_id, categoria, clave, valor (jsonb), source_id, fecha_consulta, estado (automatico / por_validar / validado) |
| `documents` | PDFs cargados | id, building_id, tipo, storage_path, cargado_por, fecha |
| `extractions` | Campos extraídos por IA | id, document_id, campo, valor, pagina, confianza, validado_por |
| `visit_notes` | Notas y fotos de visita | id, building_id, autor, texto, fotos, fecha |
| `score_config` | Pesos del puntaje (Fase 2) | id, criterio, peso |
| `profiles` | Usuarios del equipo | id, nombre, rol (admin / analista) |

**Entrada:** capas oficiales (descarga o servicio GIS), PDFs cargados por el equipo, notas de visita.
**Salida:** ficha en pantalla, PDF para el propietario, tablero de portafolio.

## 8. Requisitos no funcionales

- **Trazabilidad:** ningún dato sin fuente y fecha. La IA nunca afirma algo sin citar.
- **Datos personales:** los certificados de tradición contienen nombres y cédulas. Aplica la Ley 1581 de 2012: acceso restringido por rol, RLS en todas las tablas y política de tratamiento de datos desde el inicio.
- **Actualización:** las capas oficiales se recargan con un proceso programado (frecuencia por definir en la Fase 0) y la ficha muestra la fecha de corte.
- **Idioma:** español (es-CO). No se requiere multi-idioma (uso interno).
- **Costo de operación objetivo:** menos de USD 100 al mes sin contar certificados.

## 9. Especificación técnica

### Features (feature-first)

```
src/features/
├── buscador/        # RF-01: búsqueda por dirección, CHIP, mapa
├── ficha/           # RF-02, RF-06: ficha del edificio y PDF
├── documentos/      # RF-03, RF-04: carga y extracción IA con validación
├── visitas/         # RF-05: notas y fotos
├── portafolio/      # RF-07, RF-11: lista, mapa, etapas, tablero
├── ingesta/         # Carga y actualización de capas oficiales
├── asistente/       # RF-09 (Fase 2)
├── puntaje/         # RF-10 (Fase 2)
└── cabida/          # RF-12 (Fase 3)
```

### Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind
- **Backend:** Supabase (Auth + Postgres + **PostGIS** + Storage + RLS)
- **Mapa:** MapLibre GL (abierto, sin licencia)
- **IA:** Vercel AI SDK v5 + OpenRouter (extracción de PDFs y asistente con citas; modelo más barato que cumpla)
- **Validación:** Zod
- **Deploy:** Vercel

## 10. Fases, tiempos y estimación

Los montos usan una **tarifa ilustrativa de COP 120.000/hora**. Hay que reemplazarla por la tarifa real de DOUX.WORK antes de enviar una cotización.

| Fase | Alcance | Semanas | Horas | Costo ilustrativo (COP) |
|---|---|---|---|---|
| 0. Validación | Inventario de capas (URL, licencia, campos, llave de cruce) y prueba con los edificios reales de los 2 propietarios | 1–2 | 20–30 | 2,4–3,6 M |
| 1. Ficha del edificio (MVP) | RF-01 a RF-08 | 5–6 | 140–180 | 16,8–21,6 M |
| 2. Asistente y puntaje | RF-09 a RF-11 | 3–4 | 80–120 | 9,6–14,4 M |
| 3. Cabida preliminar | RF-12 | 2–3 | 60–90 | 7,2–10,8 M |
| **Total** | | **11–15** | **300–420** | **36–50,4 M** |

**Costo mensual de operación (aproximado, no cotizado):** hosting y base de datos alrededor de USD 45 (Vercel Pro + Supabase Pro), IA entre USD 10 y 50 según uso, y COP 23.000 por cada certificado de tradición.

**Recomendación:** cotizar y ejecutar solo las Fases 0 y 1. Con la ficha funcionando sobre edificios reales, se decide con evidencia si se sigue con las Fases 2 y 3.

### Entregables de la Fase 0

- [ ] Inventario de fuentes: URL, licencia, formato, campos, frecuencia de actualización y llave de cruce
- [ ] Prueba de cruce por CHIP en los edificios de los dos propietarios
- [ ] Lista de datos que no se pueden automatizar y cómo se cargarán
- [ ] Ajuste del alcance y la estimación de la Fase 1

## 11. KPI de éxito

- **Tiempo de prefactibilidad por edificio:** de días a menos de 1 hora (meta por validar con una medición inicial en la Fase 0).
- **Edificios evaluados por mes:** línea base por definir con el cliente.
- **Cobertura de la ficha:** al menos el 80 % de los campos automatizables llenos sin intervención manual.

## 12. Riesgos y preguntas abiertas

### Riesgos

- **Estado jurídico del POT:** el Decreto 555 se aplica tras levantarse la suspensión provisional, pero el fallo de fondo sigue pendiente ([CMS Law](https://cms.law/es/col/publication/cual-es-el-plan-de-ordenamiento-territorial-pot-vigente-en-bogota)). Un cambio obligaría a recargar la norma.
- **Capas no abiertas:** SINUPOT no muestra API pública. Si una capa solo existe como consulta web, se carga a mano o se solicita a la SDP.
- **Escala de los mapas de riesgo:** el IDIGER advierte que los mapas del POT (1:5.000) no definen el riesgo de un predio puntual.
- **Incentivos cambiantes:** el Acuerdo "Ciudad Inteligente" aparece como aprobado en una sola fuente. Hay que confirmar el texto y la vigencia.

### Preguntas para el cliente (antes de cotizar)

- [ ] ¿Cuántos edificios espera evaluar al año y en qué zonas (Centro Histórico, Teusaquillo, otras)?
- [ ] ¿Quiénes usarán la plataforma (solo él, su equipo, los propietarios)?
- [ ] ¿Qué entregable necesita la tesis: la herramienta funcionando, la metodología, o ambas?
- [ ] ¿Puede compartir las direcciones o CHIP de los edificios de los dos propietarios para la Fase 0?
- [ ] ¿Cuál es el presupuesto y la fecha límite (sustentación)?

### Fuera de alcance

- Venta de la plataforma a terceros, app móvil, pagos en línea, multi-idioma, ciudades distintas a Bogotá.

## 13. Fuentes

Consultadas el 2026-10-19 mediante búsqueda web. Algunas páginas oficiales no se pudieron abrir directamente; las cifras deben verificarse.

- [Decreto 555 de 2021 — POT Bogotá](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=119582)
- [POT 555 en Datos Abiertos Bogotá](https://datosabiertos.bogota.gov.co/dataset/pot-decreto-555-de-2021-bogota-d-c)
- [CMS Law — ¿Cuál es el POT vigente en Bogotá?](https://cms.law/es/col/publication/cual-es-el-plan-de-ordenamiento-territorial-pot-vigente-en-bogota)
- [SINUPOT — consulta de licencias](https://bogota.gov.co/mi-ciudad/planeacion/paso-paso-para-consultar-licencias-de-construccion-en-bogota)
- [SDP — preguntas frecuentes de norma urbana](https://www.sdp.gov.co/gestion-territorial/norma-urbana/preguntas-frecuentes)
- [Catastro — actualización de datos geográficos](https://bogota.gov.co/mi-ciudad/hacienda/como-consulto-la-ubicacion-geografica-de-mi-casa-y-local-en-bogota)
- [Base de datos catastral 2024](https://bogota.gov.co/mi-ciudad/hacienda/base-de-datos-catastral-de-bogota-de-2024-conocela)
- [Capa BIC — servidor GIS de Catastro](https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/recreaciondeporte/bienesinterescultural/MapServer/layers)
- [IDPC — expedición de conceptos BIC](https://bogota.gov.co/sites/default/files/inline-files/expedicion_conceptos_bic.pdf)
- [RenoBo — Reúsa y Revitaliza](https://bogota.gov.co/mi-ciudad/habitat/estrategia-de-renobo-para-promover-la-reutilizacion-de-inmuebles) · [El Tiempo](https://www.eltiempo.com/bogota/reuso-de-edificios-la-estrategia-de-renobo-para-recuperar-el-centro-de-bogota-3372059)
- [Acuerdo "Ciudad Inteligente" y renovación urbana](https://bogota.gov.co/mi-ciudad/habitat/acuerdo-ciudad-inteligente-busca-impulsar-renovacion-urbana-en-bogota) · [ABC del acuerdo](https://bogota.gov.co/mi-ciudad/hacienda/abc-del-acuerdo-por-una-ciudad-inteligente-y-que-cambia-para-bogota)
- [Tarifas 2026 del certificado de tradición](https://newsroom.rcnradio.com/actualidad/certificado-de-tradicion-y-libertad-cuales-son-las-nuevas-tarifas-para-2026)
- Referentes: [LandInsight](https://land.tech/landinsight-pricing-plans), [Archistar](https://www.capterra.com/p/213621/Archistar/), [Gridics](https://pr1.gridics.com/zoning-data-api/), [Zoneomics](https://www.zoneomics.com/blog/2025-recap-zoneomics-advancing-zoning-intelligence), [Regrid](https://regrid.com/pricing), [Searchland](https://hmlandregistry.blog.gov.uk/2022/08/18/how-searchland-is-using-our-data-to-help-land-developers/), [UrbanGPT](https://www.urbangpt.com.co/)
