# PRP-001: Modo real con Supabase

> **Estado**: EN PROGRESO (construido, migración aplicada y probado end-to-end; falta cargar el Rolher real y decidir deploy)
> **Fecha**: 2026-10-30
> **Proyecto**: Edificios (Torna)

---

## Objetivo

Que el equipo trabaje con edificios reales guardados en Supabase: matricular un edificio, ver su
ficha, cargar documentos y llenar la visita técnica, con los datos compartidos entre todos los
miembros del equipo. El modo demo sigue igual para el cliente.

## Por Qué

| Problema | Solución |
|----------|----------|
| Hoy solo funciona el demo: la ficha real devuelve "no encontrado" | La ficha se arma desde la base de datos |
| La visita técnica se guarda solo en el navegador de quien la edita | La visita y sus fotos van a Supabase y las ve todo el equipo |
| Los PDF del Rolher no se pueden publicar en el demo (traen nombres y cédulas) | Se guardan en almacenamiento privado, visibles solo para el equipo |

**Valor de negocio:** es el paso que convierte la herramienta en algo de uso diario y permite
empezar a medir el tiempo por análisis (meta: bajar de más de 6 horas).

## Qué

### Criterios de éxito
- [ ] Un analista matricula un edificio con CHIP, dirección y matrícula, y aparece en el portafolio y el mapa.
- [ ] La ficha muestra los datos guardados, cada uno con fuente, fecha y estado (automático / por validar / validado).
- [ ] Un analista puede marcar un dato como validado; queda registrado quién lo hizo.
- [ ] Se carga un PDF a la ficha; queda en el almacenamiento privado y solo se abre con sesión del equipo.
- [ ] La visita técnica (texto y fotos) se guarda en Supabase y otro miembro la ve desde su equipo.
- [ ] El Edificio Rolher real queda cargado con sus datos y documentos.
- [ ] El deploy demo actual no cambia.
- [ ] `npm run typecheck`, `npm run lint` y `npm run build` pasan.

### Comportamiento esperado
1. Portafolio → **Matricular edificio** → formulario (nombre, CHIP, dirección, matrícula, zona, coordenadas).
2. Se abre la ficha vacía, con las secciones de la metodología (`docs/FLUJO-ESTUDIO.md`) marcadas como pendientes.
3. El analista agrega o corrige datos por sección y los valida.
4. Carga el certificado de tradición y otros PDF en **Documentos**.
5. Llena la visita técnica con fotos.

### Fuera de alcance (fases siguientes)
- Lectura de PDF con IA (tabla `extractions`): PRP-002.
- Puntaje automático y semáforo calculado: por ahora se ponen a mano.
- Consulta automática a catastro, POT o BIC.
- Exportar la ficha en PDF.

---

## Contexto

- Esquema actual: `supabase/migrations/20261019000000_base.sql` (7 tablas, RLS, bucket `documentos`).
- Ficha y tipos: `src/features/ficha/` (`Edificio` es el contrato que la vista ya sabe pintar).
- Portafolio: `src/features/portafolio/services/edificios.ts` (ya lee `buildings`, sin coordenadas ni fotos).
- Visita: `src/features/visita/` (hoy guarda en localStorage e IndexedDB).
- Datos reales del Rolher: `src/features/demo/rolher.ts`.
- Interruptor demo/real: `src/shared/lib/demo.ts` (`IS_DEMO`).

### Cambios de esquema necesarios (migración nueva)
- `buildings`: agregar `nombre`, `zona`, `lat`, `lng`, `semaforo`, `resumen`, `alertas text[]`.
- `visit_notes`: agregar `informe jsonb` para la visita estructurada (secciones, hallazgos, documentos por solicitar).
- Bucket privado `fotos` para las fotos de visita, con las mismas reglas que `documentos`.
- Ruta de archivos: `{building_id}/{uuid}.{ext}`.

---

## Blueprint (fases)

1. **Migración** — columnas nuevas, bucket `fotos`, tipos de TypeScript actualizados.
2. **Leer la ficha desde la base** — servicio que arma `Edificio` con `buildings` + `data_points` + `documents` + `visit_notes`; portafolio y mapa con coordenadas y foto principal.
3. **Matricular y editar** — formulario de alta con Zod, edición de datos por sección y botón de validar.
4. **Documentos** — carga de PDF a Storage, lista en la ficha, apertura con enlace temporal firmado.
5. **Visita técnica en la base** — el editor actual guarda en `visit_notes` y las fotos en el bucket `fotos` cuando no es demo.
6. **Cargar el Rolher** — script que sube los datos reales del Rolher (los PDF los carga el equipo desde la app).
7. **Verificación** — typecheck, lint, build y prueba en navegador con el usuario admin.

## Decisiones abiertas
- **Deploy:** propuesta: el sitio actual sigue en demo para el cliente y la versión real va en un segundo proyecto de Vercel con las variables de Supabase. Falta confirmar.

---

## Alcance ampliado (2026-10-30)

El cliente envió la *lista de documentos* y la *guía de mayor y mejor uso*. El PRP creció para cubrirlas:
checklist de 44 documentos con carga de archivos, checklist A–F (52 ítems), usos candidatos (matriz G),
activador 1 (tamizaje, reglas) y activador 2 (mayor y mejor uso, fórmulas), e informe de 10 capítulos
imprimible. Detalle en `docs/FLUJO-ESTUDIO.md` v0.2.

## Estado de las fases

| Fase | Estado |
|---|---|
| 1. Migración | Aplicada el 2026-10-30 y verificada con `check:supabase` |
| 2. Ficha desde la base | Hecho: resumen con avance, portafolio y mapa con coordenadas |
| 3. Matricular y editar | Hecho (`/edificios/nuevo`, `/edificios/[id]/editar`) |
| 4. Documentos | Hecho: estado + carga directa a Storage + apertura por `/api/archivos` |
| 5. Visita técnica en la base | Hecho (`visit_notes.informe`, fotos en bucket `fotos`) |
| 6. Cargar el Rolher | Pendiente (lo hace el equipo desde la app tras la migración) |
| 7. Verificación | typecheck, lint y build en verde; smoke test en navegador con usuario temporal. Prueba end-to-end (16 pasos) en verde con la migración aplicada |

## Aprendizajes (self-annealing)

- `check:supabase` usaba `select(head: true, count)` y NO detecta tablas inexistentes con la secret key. Ahora consulta una fila real.
- Los archivos privados se sirven por `/api/archivos/[bucket]/[...ruta]` con la sesión del usuario (RLS). `next/image` no puede optimizarlos (no tiene la cookie): usar `unoptimized` para rutas `/api/`.
- Viabilidad: la primera versión usaba rentabilidad simple ≥ tasa y un VPN sin valor de salida; daba "Viable" con VPN negativo. Ahora el flujo incluye el valor de salida (neto ÷ tasa de capitalización) y viable = VPN ≥ 0.
- Si la dirección de retorno no está en *Redirect URLs* de Supabase, el enlace de correo llega a la Site URL sin ruta (`/?code=`). El proxy ahora lo reenvía a `/callback`. Al publicar en un dominio nuevo: Site URL y Redirect URLs en Supabase SIEMPRE.
- Invitaciones (`inviteUserByEmail`) devuelven la sesión en el fragmento `#access_token=`; el servidor no lo ve. `/callback` sin code ni token_hash reenvía a `/confirmar` (cliente) que hace `setSession`. `/login` reenvía cualquier fragmento con token o `error_code`. Probado con enlace real de Supabase.
- La carga de archivos va del navegador directo a Storage: las server actions tienen límite de 1 MB por defecto.
