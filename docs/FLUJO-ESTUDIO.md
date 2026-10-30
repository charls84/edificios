# Flujo del estudio: del inmueble matriculado al informe de viabilidad

> Metodología de trabajo de Torna para evaluar un edificio, de la matrícula al informe de mayor y mejor uso.
> Versión 0.2 · 2026-10-30 · Preparado por DOUX.WORK
> Fuentes: *Documentos para el análisis de un inmueble* (Torna, 27-oct-2026) y *Guía de análisis de mayor y mejor uso* v1.0 (Daniela Céspedes, Torna, 27-oct-2026).
> Estado: **implementado en la plataforma** (ver sección 9). Los criterios de los 5 filtros y la tasa mínima siguen pendientes de Torna.

---

## 1. Resumen

El estudio responde una pregunta: **¿qué es lo mejor que se puede poner en este inmueble?** Se hace en tres pasos, con dos activadores en la plataforma.

| Paso | Qué se hace | Quién | Tiempo | Activador en la plataforma |
|---|---|---|---|---|
| 0 · Matricular | Dar de alta el edificio con CHIP, dirección y contacto | Analista | 10 min | — |
| 1 · Tamizaje | Mínimo de documentos, visita, lista de usos candidatos. Se descarta lo evidente | Analista + equipo técnico | Pocos días | **Tamizaje** |
| 2 · Estudio detallado | Checklist A–F: papeles, norma, edificio, zona, mercado y números de los usos que quedaron | Analista + ingeniero + abogado | Semanas | — |
| 3 · Decisión | Matriz de usos, uso recomendado, informe de 10 capítulos | Fundador | 1 día | **Mayor y mejor uso** |

El estudio termina con el **informe de viabilidad** que se exporta en PDF y se presenta al propietario. El edificio pasa a *Presentado* o se descarta con la razón escrita.

## 2. Paso 0 — Matricular el edificio

En **Portafolio → Matricular edificio**. Datos: nombre, CHIP o dirección (el CHIP es la llave: si ya existe, se abre la ficha existente), matrícula inmobiliaria (si se conoce), zona, origen, contacto del propietario, coordenadas (opcional, para el mapa) y notas.

Al matricular, la ficha nace en etapa **Identificado** con la checklist completa de documentos en *pendiente* y la checklist A–F vacía. La pestaña **Resumen** muestra siempre el siguiente paso.

## 3. Paso 1 — Tamizaje

### 3.1 Documentos: la checklist de Torna

La pestaña **Documentos** es la lista de Torna del 27 de octubre, con 44 ítems en 4 grupos:

| Grupo | Ítems | Ejemplos |
|---|---|---|
| 1. Al propietario | 25 | Cédula o certificado de existencia, escrituras, licencias con planos, estudios estructurales, RETIE, predial de 5 años, planos originales, lista de intervenciones |
| 2. En fuentes públicas | 8 | Certificado de tradición, certificado catastral, consulta de norma en Mapas Bogotá, plusvalía y afectaciones, resoluciones que mencione el certificado |
| 3. Lo que se genera o se contrata | 5 | Visita técnica con fotos, levantamiento, diagnóstico estructural, estudio de títulos, avalúo |
| 4. Mercado y zona | 6 | Comparables, vacancia, datos del DANE, generadores de demanda, proyectos futuros |

Cada ítem muestra dónde se consigue (*en línea · parcial · no en línea*), si es **mínimo** para el tamizaje y si solo aplica en ciertos casos. Para cada uno el analista:

- cambia el **estado**: pendiente → solicitado → cargado → validado (o *no aplica*);
- **carga el archivo** (PDF, imagen, planos; hasta 25 MB) al almacenamiento privado, que solo abre el equipo con sesión;
- deja **notas** (a quién se pidió, cuándo llega).

Dos adiciones de la plataforma, marcadas con (+): la **autorización de tratamiento de datos** firmada por el propietario (Ley 1581 de 2012, porque el certificado y las escrituras traen nombres y cédulas) y la visita técnica se llena en su propia pestaña y queda *cargada* al guardarla.

**El mínimo para arrancar** (definido por Torna): certificado de tradición, certificado catastral, consulta de norma en Mapas Bogotá, licencias con planos y visita técnica. Los tres primeros se sacan en línea antes de reunirse con el propietario.

### 3.2 Visita técnica

Pestaña **Visita técnica**: el informe con las 7 secciones del formato de Torna (fachada, estructura, redes eléctricas, redes hidráulicas, pisos superiores, cubierta, entorno), hallazgos, observaciones y documentos por solicitar. Las fotos se comprimen en el navegador (pierden los metadatos de ubicación) y se guardan en el almacenamiento privado. El informe lo ve todo el equipo.

### 3.3 Usos candidatos

Pestaña **Usos candidatos**: la lista de usos que vale la pena probar, con un clic desde los usos típicos de la guía (apartaestudios, vivienda estudiantil, coliving, renta corta, oficinas, coworking, consultorios, comercio, gastronomía, hotel, educación, cultura, mixto) o escribiendo otro. Cada uso es una columna de la matriz de decisión y lleva las tres primeras pruebas: **¿lo permite la norma? ¿el edificio lo soporta? ¿hay demanda?** (sí · por verificar · no, con nota y fuente).

### 3.4 Los 5 filtros de Torna (propuesta)

Pestaña **5 filtros**. Torna definió los filtros (ubicación, estructura, entorno, norma e historia) pero no sus criterios. **Propuesta de DOUX.WORK, por validar con Torna**, con el método del *Transformation Meter* (Geraedts y van der Voordt, TU Delft), que la guía ya cita: cada filtro tiene un **criterio de veto** que descarta de una y **criterios graduales** que se puntúan 0 (desfavorable), 1 (aceptable) o 2 (favorable). Cada opción describe qué significa en Bogotá.

| Filtro | Peso | Veto | Criterios graduales |
|---|---|---|---|
| Ubicación | 20 % | U1 · acceso por vía pública, sin afectación total | U2 transporte masivo (≤ 500 m) · U3 generadores de demanda (≤ 1 km) · U4 frente y visibilidad |
| Estructura | 25 % | E1 · sin daño severo que haga inviable el reforzamiento | E2 sistema y NSR-10 · E3 altura libre (≥ 3,0 m) · E4 luz y profundidad (≤ 15 m) · E5 puntos fijos y redes |
| Entorno | 15 % | N1 · sin amenaza alta no mitigable (IDIGER) | N2 seguridad día/noche · N3 vacancia de la zona (alerta > 25 %) · N4 inversión pública cercana |
| Norma | 25 % | R1 · al menos un uso candidato permitido | R2 tratamiento · R3 nivel BIC (1 integral, 2 tipológica) · R4 incentivos · R5 tipo de trámite |
| Historia | 15 % | H1 · sin embargos, demandas ni falsa tradición | H2 propiedad y disposición · H3 coherencia registro–catastro–licencias · H4 información disponible · H5 valor arquitectónico aprovechable |

**Cálculo:** puntaje del filtro = puntos ÷ (2 × criterios evaluados), de 0 a 100. Potencial = promedio ponderado. Lectura: **70 o más, alto** (pasa al estudio detallado) · **50 a 69, medio** (pasa con condiciones) · **menos de 50, bajo** (descartar salvo razón escrita). Un veto en *no cumple* descarta. Con menos del 60 % evaluado o vetos sin evaluar, la lectura es *incompleta*. Se ve como un pentágono (radar) en la pestaña, en el resumen y en el capítulo 1 del informe.

Pesos y umbrales están en `src/features/estudio/catalogo/filtros.ts` y se ajustan cuando Torna los valide.

### 3.5 Activador 1: Tamizaje

Se habilita cuando el mínimo de documentos está cargado y hay al menos un uso candidato. La plataforma revisa, sin IA:

- los ítems de los bloques **A** (papeles), **B** (norma) y la **prueba rápida de conversión** (CV) de la checklist A–F;
- qué usos pasan la norma y el edificio.

| Semáforo | Regla | Siguiente acción |
|---|---|---|
| **Rojo** | Un ítem bloqueante marcado *no cumple* (A1 títulos, A6 afectaciones, B3 usos, B5 patrimonio, C1 estructura, CV1–CV5), o ningún uso pasa la norma | Descartar con la razón escrita, o resolver el bloqueo |
| **Amarillo** | Falta algo del mínimo, hay ítems sin resolver o usos por verificar | Completar y volver a correr |
| **Verde** | Mínimo completo, A/B/CV resueltos y al menos un uso pasa norma y edificio | Pasar al estudio detallado |

Los 5 filtros se suman al semáforo: veto o potencial bajo dan rojo; incompleto o medio, amarillo. Gana el color más grave.

El resultado se guarda con fecha y autor, pone el semáforo en la ficha y en el portafolio, y lista los documentos que faltan para el estudio detallado. Si después cambia algo, el análisis se marca *desactualizado*.

## 4. Paso 2 — Estudio detallado (checklist A–F)

Pestaña **Checklist A–F**: los 52 ítems de la guía de Torna, agrupados por prueba y bloque, cada uno con dónde se consigue o por qué importa:

| Prueba | Bloques | Ítems |
|---|---|---|
| 1 · Legal | A · Papeles del predio · B · Norma urbana | 7 + 9 |
| 2 · Física | C · El edificio y el lote · CV · Prueba rápida de conversión | 13 + 6 |
| 3 · Financiera | D · La zona · E · Mercado de cada uso · F · Números de cada uso | 6 + 5 + 6 |

Cada ítem se marca **cumple · por verificar · no cumple · no aplica** con una nota (qué se encontró, documento y página). Para la prueba financiera, los números de cada uso se llenan en su tarjeta de **Usos candidatos** (bloque F): área neta, canon por m², ocupación esperada, inversión total, gastos anuales, meses hasta el primer ingreso y riesgo.

## 5. Paso 3 — Activador 2: Mayor y mejor uso

Se habilita cuando el tamizaje se corrió, al menos un uso pasa norma y edificio, y esos usos tienen sus números. Los bloques D–F sin resolver se avisan pero no bloquean. Parámetros (todos con valor por defecto y editables; la pantalla recuerda los de la última corrida y tiene *Restablecer valores por defecto*): **tasa mínima** (12 % anual), **horizonte** (10 años), **tasa de capitalización de salida** (por defecto 12 %) y, opcional, el **valor del lote vacío**.

La plataforma calcula, solo con fórmulas (cada cifra se puede rastrear):

- ingreso bruto = área neta × canon × 12 × ocupación; ingreso neto = bruto − gastos;
- rentabilidad = neto ÷ inversión; recuperación = inversión ÷ neto;
- **valor de salida** al final del horizonte = ingreso neto anual ÷ tasa de salida (el inmueble sigue valiendo);
- **VPN** y **TIR** sobre flujos mensuales (inversión en el mes 0, sin ingreso hasta el primer ingreso, valor de salida al final);
- sensibilidades: canon −10 %, obra +20 %, colocación +6 meses;
- valor ajustado por riesgo: VPN × 1,0 (bajo) · 0,9 (medio) · 0,8 (alto).

Un uso es **viable** si pasa las tres pruebas, su ingreso neto es positivo y su **VPN a la tasa mínima es ≥ 0** (equivale a TIR ≥ tasa mínima). El **uso recomendado** es el viable con mayor valor ajustado. Si el lote vacío vale más que el mejor uso, el informe lo dice. El resultado llena la **matriz de decisión** (bloque G).

## 6. El informe de viabilidad

Pestaña **Informe**: los 10 capítulos de la guía (sección 07), armados con lo que hay en la ficha y exportables a PDF desde el navegador:

1. Resumen ejecutivo con el uso recomendado y por qué
2. Identificación del inmueble y estudio de títulos (A)
3. Análisis normativo y patrimonial (B)
4. Diagnóstico físico y áreas netas (C + visita técnica)
5. Estudio de la zona (D)
6. Estudio de mercado de cada uso (E)
7. Modelo financiero y sensibilidades (F)
8. Matriz de decisión y uso recomendado (G)
9. Riesgos (bloqueos, usos de riesgo alto, usos frágiles ante canon −10 %)
10. Siguientes pasos y documentos pendientes

El pie del informe recuerda que los cálculos no reemplazan el concepto del IDPC, la certificación del IDIGER, la visita estructural (NSR-10) ni la licencia ante curaduría.

## 7. Etapas del portafolio

| Etapa | Cuándo |
|---|---|
| Identificado | Al matricular |
| En análisis | Al correr el primer tamizaje (automático) |
| Presentado | Cuando el fundador presenta el informe al propietario |
| Descartado | Rojo en el tamizaje o uso no viable, con la razón en las notas |
| En intervención | El propietario aceptó; sale del alcance del estudio |

## 8. Qué sigue (fuera del alcance actual)

- **Lectura de PDF con IA:** extraer los campos clave de certificados y licencias con la página de donde salen, para pre-llenar la checklist A–F. Hoy el analista lee y marca.
- **Consulta automática** a Catastro, POT y capa BIC (Fase 0 original).
- **Comparables de mercado:** se registran a mano; copiar automáticamente de los portales choca con sus términos de uso.

## 9. Preguntas abiertas para Torna

1. Validar la propuesta de los 5 filtros (criterios, pesos y umbrales, sección 3.4).
2. Tasa mínima, horizonte y tasa de salida: quedan por defecto en 12 %, 10 años y 12 %, ajustables por análisis.
3. Costos de referencia por m² de adecuación y reforzamiento, o se cotiza cada caso.
4. Destinatario del informe (propietario, inversionistas o ambos): define qué datos personales se omiten.
5. Quién firma el informe.

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
- **Origen:** los planos originales muestran el "Edificio Uricoechea", proyecto comercial de A. Manrique Martín y Cía. aprobado por la Secretaría de Obras Públicas el 16 de diciembre de 1936. El certificado registra la declaración de construcción en 1943; la presentación del IDU lo fechaba en la década de 1940. El primer piso original marca unos 173 m² construidos, cifra cercana al lote de la licencia (173,33 m²).
- **Dirección:** el informe de visita usaba "Carrera 10 # 13-22"; los documentos oficiales dicen Av. Jiménez # 9-82/88 (Calle 13 # 9-84 catastral) y Carrera 10 # 13-02/12. La ficha usa la dirección catastral.

### Documentos que faltan

- Certificado catastral (área oficial del lote y avalúo).
- Escritura 2320 de 2011 (cancelación de la propiedad horizontal).
- Estado de cuenta del predial y de valorización.
- Certificado de permiso de ocupación o acta de terminación de la obra de 2013.
- Planos aprobados (arquitectónicos y estructurales) de la licencia de 2013. Ya se tienen los planos originales de 1936 (fachada y primer piso).
- Resolución 2724 de 2012 del Ministerio de Cultura.
- Certificado de existencia y representación legal de Rolher Ltda. (vigente).
- Autorización de tratamiento de datos firmada.
