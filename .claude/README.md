# SaaS Factory V5 - Template Documentation

> **Fuente de verdad del template.** Guardada en `.claude/` para preservarla durante el desarrollo de proyectos.

---

## Que es SaaS Factory?

Template **production-ready** para crear aplicaciones SaaS modernas con desarrollo asistido por IA. Filosofia Henry Ford: un solo stack perfeccionado.

### Lo que incluye

- Next.js 16 (App Router) + TypeScript
- Supabase (Database + Auth)
- Tailwind CSS + shadcn/ui
- 19 Skills de Claude Code (V4 Skills 2.0)
- Arquitectura Feature-First optimizada para IA
- Auto port detection (3000-3006)
- Testing, linting y type checking configurados
- 5 Design Systems listos para usar
- AI Templates (Vercel AI SDK v5 + OpenRouter)

---

## Tech Stack (Golden Path)

```yaml
Runtime: Node.js + TypeScript
Framework: Next.js 16 (App Router)
Database: PostgreSQL/Supabase
Styling: Tailwind CSS 3.4
Components: shadcn/ui
State: Zustand
Validation: Zod
Testing: Playwright CLI + MCP
AI Engine: Vercel AI SDK v5 + OpenRouter
Deploy: Vercel
```

**Por que Email/Password y no OAuth?**
Para evitar bloqueos de bots durante testing. Google OAuth requiere verificacion.

---

## Arquitectura Feature-First

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas auth (grupo)
│   ├── (main)/              # Rutas principales
│   ├── layout.tsx
│   └── page.tsx
│
├── features/                 # Organizadas por funcionalidad
│   ├── auth/
│   │   ├── components/      # LoginForm, SignupForm
│   │   ├── hooks/           # useAuth, useSession
│   │   ├── services/        # authService.ts
│   │   ├── types/           # User, Session
│   │   └── store/           # authStore.ts
│   │
│   └── [tu-feature]/        # Misma estructura
│
└── shared/                   # Codigo reutilizable
    ├── components/          # Button, Card, Input
    ├── hooks/               # useDebounce, useLocalStorage
    ├── lib/                 # supabase.ts
    ├── types/               # Tipos compartidos
    └── utils/               # helpers
```

> **Por que Feature-First?** Cada feature tiene TODO lo necesario en un solo lugar. Perfecto para que la IA entienda contexto completo sin navegar multiples carpetas.

---

## Quick Start

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env.local

# Editar con tus credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Configurar MCPs (Opcional)

```bash
cp .claude/example.mcp.json .mcp.json
# Editar con tu project ref de Supabase
```

### 4. Iniciar Desarrollo

```bash
npm run dev
# Auto-detecta puerto disponible (3000-3006)
```

---

## Comandos npm

### Development
```bash
npm run dev          # Servidor desarrollo (auto-port 3000-3006)
npm run build        # Build para produccion
npm run start        # Servidor produccion
```

### Quality Assurance
```bash
npm run lint         # ESLint
npm run lint:fix     # Fix automatico
npm run typecheck    # TypeScript check
```

---

## Skills (V4 Skills 2.0)

> V4 migra TODO a Skills 2.0. Hot reload, auto-discovery, zero config.
> Cada skill es una carpeta con `SKILL.md` (frontmatter YAML + instrucciones).

> **Inventario de skills:** la lista completa, actualizada y con triggers vive en
> [`skills/SKILLS_README.md`](skills/SKILLS_README.md) — **30 skills core (18 de V4 + 12 de V5) + packs verticales**.
> Esta seccion se removio para no duplicar el listado (era la causa de que quedara desactualizado
> con nombres viejos). Los nombres reales de carpeta son la unica fuente de verdad.

### Crear un Nuevo Skill

```bash
# Opcion 1: Usar skill-creator
/skill-creator

# Opcion 2: Manual
mkdir .claude/skills/mi-skill
# Crear SKILL.md con frontmatter + instrucciones
```

---

## MCPs Configurados

- **Next.js DevTools** - Conectado a `/_next/mcp` para debug en tiempo real
- **Playwright** - Validacion visual y testing automatizado (CLI preferido sobre MCP)
- **Supabase** - Integracion directa con DB y auth

---

## Sistema PRP (Product Requirements Proposals)

> Contrato humano-IA antes de escribir codigo.

```
1. Humano: "Necesito [feature]"
2. /prp [feature] → IA investiga y genera PRP
3. Humano revisa y aprueba
4. /bucle-agentico → Ejecuta fase por fase
```

| Seccion | Proposito |
|---------|-----------|
| **Objetivo** | Que se construye (estado final) |
| **Por Que** | Valor de negocio |
| **Que** | Comportamiento + criterios de exito |
| **Contexto** | Docs, referencias, gotchas |
| **Blueprint** | Fases de implementacion |
| **Validacion** | Tests, linting, verificacion |

---

## AI Templates - Sistema de Bloques LEGO

Templates copy-paste para construir agentes IA con **Vercel AI SDK v5 + OpenRouter**.

| # | Bloque | Descripcion |
|---|--------|-------------|
| 00 | Setup Base | Configuracion inicial |
| 01 | Chat Streaming | Chat con useChat |
| 01-ALT | Action Stream | Agente transparente paso a paso |
| 02 | Web Search | Busqueda con :online |
| 03 | Historial | Persistencia en Supabase |
| 04 | Vision | Analisis de imagenes |
| 05 | Tools | Funciones/herramientas |
| 06 | RAG | pgvector + embeddings |

Standalone: `single-call`, `structured-outputs`, `generative-ui`

Usa `/ai [template]` para implementar cualquier bloque.

---

## Design Systems

Sistemas de diseno visuales en `.claude/design-systems/`.

| Sistema | Estilo |
|---------|--------|
| **Liquid Glass** | iOS-like, transparencias |
| **Gradient Mesh** | Degradados fluidos |
| **Neumorphism** | Soft UI, sombras suaves |
| **Bento Grid** | Grids asimetricos |
| **Neobrutalism** | Bold, bordes duros |

---

## Estructura de .claude/

```
.claude/
├── skills/                    # 30 skills core + packs verticales (ver SKILLS_README.md)
│   │  ── Construccion (18 de V4) ──
│   ├── new-app/  add-login/  add-payments/  add-emails/  add-mobile/
│   ├── website-3d/  prp/  bucle-agentico/  ai/  supabase/  playwright-cli/
│   ├── primer/  update-sf/  eject-sf/  memory-manager/  image-generation/
│   ├── autoresearch/  skill-creator/
│   │  ── Operacion de Negocio (12 de V5) ──
│   ├── factory-brain/  outcomes/  acquisition/  mission-control/  guardian/
│   ├── vertical-pack/  parallel-build/  quality-gates/  cost-optimizer/
│   ├── compliance/  onboarding/  i18n/
│   │  ── Packs verticales ──
│   └── pack-cold-email/
│
├── PRPs/                      # Product Requirements Proposals
│   └── prp-base.md           # Template base
│
│   │   └── references/       # AI Templates (11 bloques)
│   ├── agents/               # Templates secuenciales
│   └── [standalone]          # Templates independientes
│
├── design-systems/            # Sistemas de diseno
│   ├── neobrutalism/
│   ├── liquid-glass/
│   ├── gradient-mesh/
│   ├── bento-grid/
│   └── neumorphism/
│
├── hooks/                     # Scripts en eventos
├── example.mcp.json           # Config de MCPs
└── README.md                  # Este archivo
```

---

## Supabase Setup

### 1. Crear Proyecto

Visita `supabase.com/dashboard`, crea nuevo proyecto, copia URL y Anon Key.

### 2. Cliente Configurado

```typescript
// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 3. Migraciones

```bash
# Guardar en supabase/migrations/
# Ejemplo: supabase/migrations/001_create_users.sql
```

---

## Troubleshooting

### Puerto Ocupado (EADDRINUSE)

```bash
# El auto-port detection deberia resolver esto
# Si persiste, usa el alias kill-ports o:
lsof -i :3000
kill -9 <PID>
```

### TypeScript Errors

```bash
npm run typecheck
rm -rf .next
npm install
```

---

## Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Variables de Entorno

En tu dashboard de Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Template Version:** 4.0.0
**Last Updated:** 2026-03-08

---

*SaaS Factory V4: Todo es un Skill. Hot reload. Auto-discovery. Zero config.*
