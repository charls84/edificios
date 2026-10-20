# Edificios · Ficha de prefactibilidad

Herramienta web **de uso interno** para evaluar el potencial de rehabilitación de edificios
desocupados en Bogotá. Con una dirección o un CHIP arma la **ficha del edificio**: reúne datos
oficiales (catastro, POT, patrimonio, PEMP, riesgo), lee los documentos cargados con IA y
deja todo con fuente y fecha.

- **Lógica de negocio, alcance y fases:** [`BUSINESS_LOGIC.md`](BUSINESS_LOGIC.md)
- **Configuración de Supabase paso a paso:** [`docs/SETUP.md`](docs/SETUP.md)

## Estado

| Parte | Estado |
|---|---|
| Login solo por invitación, recuperación de contraseña, pantalla de Equipo | ✅ Construido |
| Portafolio por etapas (Bento Grid) | ✅ Construido (sin buscador todavía) |
| Esquema de base de datos de la Fase 1 con reglas de acceso (RLS) | ✅ Escrito, pendiente de instalar en Supabase |
| Conexión con Supabase | ⏳ Pendiente (ver `docs/SETUP.md`) |
| Fase 0: validación de datos con edificios reales | ⏳ Pendiente de los CHIP o direcciones |
| Ficha del edificio, carga de PDFs con IA, exportación a PDF | ⏳ Fase 1 |

## Ver el demo en tu computador

Requiere Node.js 20 o superior (https://nodejs.org, versión LTS).

```bash
npm install
npm run demo
```

Abrir **http://localhost:3000** y hacer clic en **Entrar al demo**. Funciona sin Supabase y
todos los datos son ficticios.

## Correr el proyecto

```bash
npm install
cp .env.local.example .env.local   # llenar con las llaves (nunca subirlas al repo)
npm run check:supabase             # verifica conexión, tablas y reglas de acceso
npm run dev
```

Otros comandos: `npm run build`, `npm run typecheck`, `npm run lint`.

## Variables de entorno

| Variable | Dónde se usa | ¿Es secreta? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Navegador y servidor | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Navegador y servidor | No (es pública por diseño) |
| `SUPABASE_SECRET_KEY` | Solo servidor (invitar usuarios) | **Sí.** Nunca en el repo ni en un chat |
| `NEXT_PUBLIC_SITE_URL` | Enlaces de invitación y recuperación | No |

## Estructura

```
src/
├── app/
│   ├── (auth)/        # login, recuperar contraseña, definir contraseña, callback
│   └── (main)/        # portafolio (dashboard) y equipo
├── features/
│   ├── auth/          # formularios y acciones de sesión
│   ├── equipo/        # invitaciones (solo admin)
│   └── portafolio/    # conteo por etapa
├── lib/supabase/      # clientes de Supabase y protección de rutas
└── shared/            # tipos y sesión
supabase/migrations/   # esquema de la base de datos
scripts/               # verificación de la conexión
docs/                  # guías de configuración
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 3.4 · Supabase (Auth + Postgres + PostGIS +
Storage + RLS) · Zod. Construido sobre la plantilla SaaS Factory (ver `CLAUDE.md`).

## Datos personales

Los certificados de tradición tienen nombres y cédulas. Aplica la **Ley 1581 de 2012**: acceso
solo para el equipo invitado, reglas de acceso en todas las tablas y documentos en almacenamiento
privado.
