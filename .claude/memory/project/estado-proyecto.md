---
tipo: project
actualizado: 2026-10-30
---
# Estado del proyecto Edificios

**Qué es:** herramienta interna (no SaaS) para la ficha de prefactibilidad de edificios en Bogotá.
Fuente de verdad: `BUSINESS_LOGIC.md` (v0.3).

**Decisiones tomadas**
- Ritmo por fases, sin fecha fija. Primero Fase 0 (validación de datos) y Fase 1 (ficha).
- Entregable de la tesis: herramienta funcionando + metodología.
- Diseño Bento Grid con la identidad de Torna (ver docs/MARCA.md). Nombre visible: Torna.
- Login solo por invitación; usuarios nuevos nacen `sin_acceso`. Sin pagos ni multi-idioma (es-CO).
- Ley 1581 (Colombia), no LFPDPPP.
- PWA: src/app/manifest.ts, public/sw.js (SIN handler de fetch: rompe iOS), PWARegister en el layout raíz,
  iconos en public/icons. El proxy excluye sw.js, manifest.webmanifest e icons/ (si no, redirige a /login).
- Navegación: barra lateral fija en escritorio (lg+) y panel deslizable con ☰ en celular/tablet
  (src/shared/components/navegacion.tsx).
- Bilingüe ES/EN con next-intl (cookie NEXT_LOCALE, sin prefijo en URL; es por defecto). Glosario EN: ficha =
  building profile, en análisis = under review, presentado = presented to owner, en intervención = under
  rehabilitation, por validar = pending validation, visita técnica = technical site visit, certificado de
  tradición = certificate of title, embargo = attachment. POT, PEMP, BIC, CHIP, NSR-10, RETIE no se traducen.
- Llaves de Supabase en formato nuevo: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`.
- RED Atlas (mercado) y Croma (debida diligencia) solo como candidatos de Fase 2.
- Base catastral de Bogotá descargable (PostgreSQL, CC BY 4.0): usarla en Fase 0/1.

**Edificio Rolher (real)** — CHIP AAA0257KADM, matrícula 50C-297658, Av. Jiménez (Calle 13) # 9-84, esquina
Carrera 10 (el informe de visita decía "Carrera 10 # 13-22", que es incorrecta). Ficha con datos reales de: certificado
de tradición (26-oct-2026), licencia LC 13-4-0066 (2013), Res. IDPC 492 de 2012, presentación IDU 2010 y planos
originales de 1936. Hallazgos y faltantes en `docs/FLUJO-ESTUDIO.md` (sección 10). Los PDF NO se publican en el demo
(traen nombres y cédulas); solo los datos del edificio. Visita técnica editable en `src/features/visita/`.
Los demás edificios del demo siguen siendo ficticios.

**Metodología del estudio:** `docs/FLUJO-ESTUDIO.md` (7 pasos, matrícula, documentos obligatorios/recomendados).

**Supabase (a 2026-10-30)** — migración base aplicada y verificada. **Migración del estudio
(`20261030000000_estudio.sql`) escrita pero NO aplicada**: el usuario la pega en SQL Editor (docs/SETUP.md Parte 2)
y se verifica con `npm run check:supabase` (ahora detecta tablas faltantes de verdad).

**Modo real (construido 2026-10-30, PRP-001)** — `src/features/estudio/`: catálogo de 44 documentos (lista de Torna)
y 46 ítems A–F (guía de mayor y mejor uso), usos candidatos, tamizaje (reglas) y mayor y mejor uso (fórmulas: VPN/TIR
mensual, sensibilidades, valor ajustado por riesgo), informe de 10 capítulos imprimible. Rutas:
`/edificios/nuevo`, `/edificios/[id]/{editar,documentos,checklist,usos,visita,analisis,informe}`. Archivos privados por
`/api/archivos/[bucket]/[...ruta]`; carga directa navegador→Storage. En demo, la ficha sigue siendo la de una página.
Metodología: `docs/FLUJO-ESTUDIO.md` v0.2. Pendiente: aplicar migración, prueba end-to-end, cargar el Rolher real,
decidir deploy (segundo proyecto de Vercel para la versión real; el demo sigue igual).
Preguntas abiertas para Torna: criterios de los 5 filtros, tasa mínima/horizonte, costos de referencia, destinatario y firma del informe.

**Pendiente**
- CHIP o direcciones de los edificios del segundo propietario (Fase 0).
