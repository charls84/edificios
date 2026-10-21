---
tipo: project
actualizado: 2026-10-20
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
- Llaves de Supabase en formato nuevo: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`.
- RED Atlas (mercado) y Croma (debida diligencia) solo como candidatos de Fase 2.
- Base catastral de Bogotá descargable (PostgreSQL, CC BY 4.0): usarla en Fase 0/1.

**Edificio Rolher (real)** — Carrera 10 # 13-22. Visita técnica 2026-10-18 (Daniela Céspedes · Torna).
Datos y fotos en `src/features/demo/rolher.ts` y `public/demo/rolher/` (incluye el PDF). Solo se usa lo que
dice el informe; catastro, POT, patrimonio y propiedad quedan pendientes de la Fase 0. Coordenadas aproximadas.
Los demás edificios del demo siguen siendo ficticios.
En la ficha de Rolher se conservan los datos oficiales DE EJEMPLO (marcados "Por validar" + aviso) a pedido del
usuario; el informe va en la sección "Visita técnica", editable y con carga de fotos (`src/features/visita/`).
En el demo los cambios se guardan en el navegador (localStorage + IndexedDB); en la Fase 1 pasan a Supabase
(tabla visit_notes / Storage "documentos").

**Pendiente (a 2026-10-20)**
- Proyecto Supabase `xeywtjnyoqqqmaomvfcd`: correr migración, cerrar registro, primer admin.
- Rotar secret key y deshabilitar llaves legacy (se expusieron en el chat).
- Entorno en la nube: permitir `*.supabase.co` y cargar variables; verificar con `npm run check:supabase`.
- CHIP o direcciones de los edificios de los dos propietarios (bloquea Fase 0).
