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

**Pendiente (a 2026-10-20)**
- Proyecto Supabase `xeywtjnyoqqqmaomvfcd`: correr migración, cerrar registro, primer admin.
- Rotar secret key y deshabilitar llaves legacy (se expusieron en el chat).
- Entorno en la nube: permitir `*.supabase.co` y cargar variables; verificar con `npm run check:supabase`.
- CHIP o direcciones de los edificios de los dos propietarios (bloquea Fase 0).
