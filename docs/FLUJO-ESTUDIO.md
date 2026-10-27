# Flujo del estudio de prefactibilidad

> Metodología de trabajo de Torna para evaluar un edificio, de la matrícula a la ficha presentada al propietario.
> Versión 0.1 · 2026-10-27 · Preparado por DOUX.WORK
> Estado: **propuesta para validar con Torna**. Los criterios de descarte y los tiempos objetivo son supuestos que se ajustan con los edificios de la Fase 0.

---

## 1. Resumen

Cada edificio pasa por 7 pasos. El estudio termina con una de dos decisiones: **presentar** el edificio al propietario o **descartarlo**, y siempre con la razón escrita.

| # | Paso | Responsable | Etapa en el portafolio | Tiempo objetivo de trabajo* |
|---|---|---|---|---|
| 1 | Matricular el edificio | Analista | Identificado | 10 min |
| 2 | Consultar datos oficiales | Plataforma + analista | En análisis | 15 min |
| 3 | Solicitar y cargar documentos | Analista + propietario | En análisis | 15 min (más la espera) |
| 4 | Visita técnica | Equipo técnico | En análisis | Medio día en campo |
| 5 | Validar datos | Analista | En análisis | 15 min |
| 6 | Decidir (semáforo) | Fundador | En análisis | 10 min |
| 7 | Presentar la ficha | Fundador | Presentado o Descartado | — |

\* Tiempo de escritorio del analista, sin contar la espera de documentos ni la visita. La meta del proyecto es pasar de más de 6 horas a menos de 1 hora por edificio.

Si el propietario acepta la propuesta, el edificio pasa a **En intervención** y sale del alcance de este estudio.

## 2. Paso 1 — Matricular un edificio nuevo

Matricular es dar de alta el edificio en la plataforma para que tenga su ficha y aparezca en el mapa.

### Datos para matricular

| Dato | Obligatorio | Para qué sirve |
|---|---|---|
| CHIP **o** dirección | Sí (uno de los dos) | Identifica el predio. El CHIP es la llave principal; con la dirección la plataforma busca el CHIP |
| Nombre del edificio | Sí | Cómo lo llama el equipo (ej. "Edificio Rolher") |
| Origen | Sí | Cómo llegó: propietario conocido, recorrido, RenoBo, referido |
| Contacto del propietario o intermediario | Sí | A quién se le piden los documentos y se presenta la ficha |
| Matrícula inmobiliaria | No | Si ya se conoce; si no, sale del certificado de tradición |
| Foto de fachada | No | Para reconocerlo en el portafolio |

### Qué hace la plataforma al matricular

1. Revisa que el CHIP no esté ya registrado. Si existe, abre la ficha existente en vez de crear una duplicada.
2. Ubica el predio en el mapa con las coordenadas de Catastro.
3. Crea la ficha en etapa **Identificado** con la lista de documentos pendientes (sección 5).
4. Registra quién lo matriculó y cuándo.

## 3. Paso 2 — Consultar datos oficiales

Con el CHIP, la plataforma trae lo que está en fuentes públicas. Cada dato queda con su **fuente, fecha de consulta y enlace**.

| Bloque de la ficha | Fuente | Cómo llega |
|---|---|---|
| Identificación catastral: área, avalúo, uso, estrato | Catastro Bogotá (UAECD / IDECA) | Automático |
| Norma POT: tratamiento, uso, edificabilidad | POT Decreto 555 de 2021 + SINUPOT | Automático en parte; interpretación revisada por el analista |
| Patrimonio: BIC, sector de interés cultural | Capa BIC de Catastro + IDPC | Automático (detección); el concepto se pide aparte |
| PEMP Centro Histórico: nivel de intervención | Res. 088 de 2021, mod. Res. 092 de 2023 | Automático |
| Amenaza y riesgo | Mapas del POT 555 + IDIGER | Automático (indicativo, escala 1:5.000) |
| Licencias previas | SINUPOT, módulo de curadurías | Consulta del analista |
| Incentivos | RenoBo, Acuerdo "Ciudad Inteligente" | Reglas mantenidas por el equipo |

La conexión automática con estas fuentes se construye y se prueba en la **Fase 0**. Mientras tanto, el analista las consulta a mano y las registra en la ficha.

## 4. Paso 3 — Solicitar y cargar documentos

El analista envía al propietario la lista de la sección 5 y compra los certificados que se piden en línea. Cada PDF se carga en la ficha; la IA extrae los campos clave con la página de donde salen y los deja **por validar**.

## 5. Documentos que se cargan en la plataforma

### A. Obligatorios para cerrar el estudio

| Documento | Quién lo da / dónde se obtiene | Qué extrae la plataforma | Vigencia recomendada |
|---|---|---|---|
| **Certificado de tradición y libertad** | Superintendencia de Notariado y Registro (SNR), en línea, COP 23.000 (2026) | Propietarios actuales, matrícula, embargos, hipotecas, demandas, afectaciones, englobes y desenglobes | Menos de 30 días |
| **Certificado catastral** | Catastro Bogotá, en línea | CHIP, áreas de terreno y construida, avalúo, uso, estrato, destino económico | Del año en curso |
| **Escritura pública vigente** | Propietario (o notaría) | Linderos, área, título de adquisición, régimen de propiedad horizontal | La última |
| **Estado de cuenta del impuesto predial** | Secretaría Distrital de Hacienda o propietario | Deudas de predial por año | Del año en curso |
| **Autorización de tratamiento de datos** firmada por el propietario | Torna (formato propio) | — | Una vez por propietario |
| **Informe de visita técnica** | Equipo técnico de Torna | Estado por sistema: estructura, fachada, cubierta, redes, acabados | De la última visita |
| **Fotos de la visita** | Equipo técnico | — | De la última visita |

La autorización de tratamiento de datos es necesaria porque el certificado de tradición y la escritura traen nombres y cédulas (Ley 1581 de 2012).

### B. Recomendados (pedir al propietario)

| Documento | Para qué sirve |
|---|---|
| Planos arquitectónicos (estado actual) | Áreas reales, distribución y base para la cabida (Fase 3) |
| Planos y estudio estructural; licencia de reforzamiento | Confirmar cumplimiento de la NSR-10 |
| Licencias de construcción anteriores | Saber qué se aprobó y qué se construyó sin licencia |
| Certificaciones RETIE (eléctrica) y planos hidrosanitarios | Estado de las redes y costo de adecuación |
| Paz y salvo o estado de cuenta de valorización (IDU) | Deudas que se trasladan al comprador |
| Últimas facturas de servicios públicos | Deudas y servicios activos |
| Contratos de arrendamiento vigentes | Ocupación y compromisos con terceros |

### C. Solo si aplica

| Documento | Cuándo se pide |
|---|---|
| Resolución de declaratoria BIC o concepto técnico del IDPC | El predio aparece como Bien de Interés Cultural o en sector de interés cultural |
| Certificación de amenaza y riesgo del IDIGER | El mapa del POT marca amenaza media o alta |
| Reglamento de propiedad horizontal | El edificio está sometido a propiedad horizontal |
| Certificado de existencia y representación legal (Cámara de Comercio) | El propietario es una empresa |
| Poder o autorización del intermediario | Quien negocia no es el propietario |

### Formato de carga

- PDF para documentos (escaneado legible o digital). Fotos en JPG o PNG.
- Un archivo por documento, con su tipo elegido de la lista anterior.
- Los documentos quedan privados: solo los ve el equipo con acceso a la plataforma.

## 6. Paso 4 — Visita técnica

El equipo técnico recorre el edificio y llena el informe en la sección **Visita técnica** de la ficha, con fotos por sección (estructura, fachada, cubierta, redes, acabados, entorno). El informe del Edificio Rolher del 18 de octubre de 2026 es el modelo.

## 7. Paso 5 — Validar datos

El analista revisa cada dato marcado **por validar** (consultado a mano o extraído por la IA) y lo confirma o lo corrige contra el documento. Solo los datos validados cuentan para el semáforo y salen en el PDF.

## 8. Paso 6 — Decidir con el semáforo

| Semáforo | Significado | Siguiente acción |
|---|---|---|
| Verde | Sin bloqueos: la norma permite el uso, la propiedad está libre y el estado es recuperable | Presentar al propietario |
| Amarillo | Hay pendientes que no bloquean, pero falta información o hay un costo por precisar | Completar documentos o pedir conceptos; volver a decidir |
| Rojo | Hay al menos un bloqueo | Descartar y escribir la razón |

**Bloqueos propuestos (para validar con Torna):**

- Embargo, demanda o falsa tradición que impide negociar el inmueble.
- Norma que no permite el uso que se quiere dar al edificio.
- Nivel de intervención del PEMP o del IDPC que impide la adecuación necesaria.
- Riesgo alto no mitigable según el IDIGER.
- Daño estructural cuyo costo hace inviable el proyecto.
- Propietario que no está dispuesto a negociar.

En la Fase 2 el semáforo se complementa con un puntaje de pesos editables (norma, patrimonio, riesgo, incentivos, estado).

## 9. Paso 7 — Presentar la ficha

La plataforma exporta la ficha en PDF con fuentes y fecha de corte, sin datos personales que no hagan falta. El fundador la presenta al propietario y mueve el edificio a **Presentado**. Si el propietario acepta, pasa a **En intervención**.

## 10. Estado del Edificio Rolher

Actualizado el 2026-10-27 con los documentos entregados por el propietario.

| Paso | Estado |
|---|---|
| 1. Matrícula | Hecho. CHIP AAA0257KADM, matrícula 50C-297658, Av. Jiménez (Calle 13) # 9-84, esquina Carrera 10 |
| 2. Datos oficiales | Parcial: patrimonio, riesgo y norma de 2013 salen de la licencia y del IDPC. Falta la norma vigente (POT 555), el nivel PEMP y los incentivos |
| 3. Documentos | Cargados: certificado de tradición (26-oct-2026), licencia LC 13-4-0066 (2013), Resolución IDPC 492 de 2012, presentación de patrimonio del IDU (2010) e informe de visita |
| 4. Visita técnica | Hecho. Informe del 18 de octubre de 2026 con fotos |
| 5. Validación | Pendiente: todos los datos extraídos están "por validar" |
| 6. Decisión | Amarillo: sin bloqueos jurídicos, pero con pendientes de patrimonio, licencia y área |
| 7. Presentación | Pendiente |

### Hallazgos de los documentos

- **Propiedad libre:** el dueño es Rolher Ltda. desde 1983. No hay embargos, hipotecas ni demandas vigentes.
- **Bien de Interés Cultural Categoría B** (conservación tipológica) dentro del Centro Histórico, que es BIC nacional. Un proyecto nuevo necesita concepto del IDPC y autorización del Ministerio de Cultura.
- **Obra ya aprobada en 2012–2013:** demolición parcial sobre la Carrera 10, fachada nueva en piedra, reforzamiento NSR-10 y un local en sótano y primer piso. Coincide con lo visto en la visita.
- **Licencia vencida:** la LC 13-4-0066 tenía 24 meses de vigencia, más 12 de prórroga. Hay que confirmar si la obra se terminó y si existe el certificado de permiso de ocupación. Un cambio de uso (por ejemplo, a vivienda) requiere licencia nueva.
- **Expropiación parcial:** el IDU tomó 36,60 m² en 2012 para el espacio público de la Carrera 10 (TransMilenio).
- **Diferencia de áreas:** el lote mide 183,33 m² en el certificado y 173,33 m² en la licencia. Se aclara con Catastro.
- **Propiedad horizontal cancelada en 2011:** el certificado aún lista 23 matrículas derivadas (locales, salones y depósitos). Hay que verificar que estén cerradas.
- **Dirección:** el informe de visita usaba "Carrera 10 # 13-22"; los documentos oficiales dicen Av. Jiménez # 9-82/88 (Calle 13 # 9-84 catastral) y Carrera 10 # 13-02/12. La ficha usa la dirección catastral.

### Documentos que faltan

- Certificado catastral (área oficial del lote y avalúo).
- Escritura 2320 de 2011 (cancelación de la propiedad horizontal).
- Estado de cuenta del predial y de valorización.
- Certificado de permiso de ocupación o acta de terminación de la obra de 2013.
- Planos aprobados (arquitectónicos y estructurales) de la licencia de 2013.
- Resolución 2724 de 2012 del Ministerio de Cultura.
- Certificado de existencia y representación legal de Rolher Ltda. (vigente).
- Autorización de tratamiento de datos firmada.
