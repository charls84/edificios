# El Loop Cerrado V5 — Mapa de Relaciones entre Skills

> **Para qué sirve este archivo:** los 12 skills de V5 son módulos autocontenidos (eso es bueno:
> portables y componibles). Pero el agente debe saber que **no son islas** — forman un ciclo.
> Este documento hace explícitas las conexiones entre ellos para que, al operar un proyecto V5,
> el agente entienda que `outcomes` alimenta a `factory-brain`, que `guardian` reporta a
> `mission-control`, etc. Referenciado desde `CLAUDE.md` (sección "Identidad del Sistema").

---

## El ciclo en una línea

```
Construye → Lanza → OPERA → MIDE → APRENDE → (mejor Construye…)
```

Lo nuevo de V5 son los eslabones **OPERA → MIDE → APRENDE**, y los 12 skills que los habilitan.

---

## Los 7 pilares y cómo se conectan

### Pilar 1 — Aprendizaje compuesto
- **`factory-brain`** — meta-memoria GLOBAL cross-proyecto (`~/.saas-factory/brain/`).
- **Recibe de:** `outcomes` (lo que funcionó, con evidencia) y `vertical-pack` (packs reusables).
- **Alimenta a:** cualquier proyecto NUEVO al inicio (hereda defaults: qué design system convierte, qué stack, pitfalls).

### Pilar 2 — Cierre del loop (medición)
- **`outcomes`** — ingiere métricas reales (revenue, conversión, activación, churn) de Vercel Analytics / Supabase / Polar.
- **Recibe de:** `onboarding` (mide el evento `activated`), `cost-optimizer` (registra tokens/costo por llamada en la tabla `events`), `acquisition` (mide qué canales convierten).
- **Alimenta a:** `factory-brain` (destila aprendizajes), `mission-control` (datos del tablero).

### Pilar 3 — Distribución
- **`acquisition`** — SEO programático + contenido + redes + ads → de "deployado" a primeros usuarios.
- **Se apoya en:** `i18n` (SEO localizado: `generateMetadata` por idioma), `onboarding` (que el usuario que llega se active).
- **Reporta a:** `outcomes` (qué canal trae usuarios que convierten).

### Pilar 4 — Operación autónoma
- **`guardian`** — vigila producción, auto-arregla builds, errores → PRs, QA periódico (con freno humano).
- **`mission-control`** — dashboard del portafolio: salud, deploy, revenue, errores de TODAS las apps.
- **Conexión:** `guardian` genera alertas/estado → `mission-control` los muestra; ambos leen métricas de `outcomes`.

### Pilar 5 — Compounding del output
- **`vertical-pack`** — convierte un proyecto terminado en un skill reusable (ej. `pack-cold-email`).
- **Alimenta a:** `factory-brain` (reutilización cross-proyecto) y al catálogo de skills.

### Pilar 6 — Velocidad y calidad
- **`parallel-build`** — construcción multi-agente en paralelo + verificación adversarial.
- **`quality-gates`** — gates duros antes de deploy (typecheck, a11y, Core Web Vitals, conversión, costo-IA).
- **`cost-optimizer`** — unit economics: modelo más barato que cumple, costo-IA por usuario.
- **Conexión:** `quality-gates` usa el gate de costo-IA de `cost-optimizer`; `cost-optimizer` registra costos vía `outcomes`.

### Pilar 7 — Blind spots resueltos
- **`compliance`** — privacidad/legal/cookies/borrado de datos. OBLIGATORIO antes de deploy con datos.
- **`onboarding`** — first-run experience → activación al primer valor (mueve el número que mide `outcomes`).
- **`i18n`** — internacionalización LatAm-first (se conecta con `acquisition` para SEO multi-idioma).

---

## Diagrama de flujo (quién alimenta a quién)

```
                     ┌─────────────────────────────────────────┐
                     │              factory-brain               │  ← aprende de todo
                     └───────▲───────────────────────▲──────────┘
                             │                        │
                     destila lo que funcionó    packs reusables
                             │                        │
                        ┌────┴─────┐            ┌──────┴───────┐
                        │ outcomes │◄───────────│ vertical-pack│
                        └────▲─────┘            └──────────────┘
          mide activación │  │  │ costo-IA / canal
        ┌─────────────────┘  │  └──────────────────┐
   ┌────┴─────┐         ┌─────┴──────┐        ┌──────┴───────┐
   │onboarding│         │ acquisition│        │cost-optimizer│
   └──────────┘         └─────▲──────┘        └──────────────┘
                              │ SEO localizado
                         ┌────┴────┐
                         │  i18n   │
                         └─────────┘

   Operación:  guardian ──alertas/estado──► mission-control  (ambos leen outcomes)
   Calidad:    parallel-build ──► quality-gates ──(usa)──► cost-optimizer
   Legal:      compliance  (gate obligatorio antes de deploy con datos)
```

---

## Regla para el agente

Cuando operes un proyecto V5, **no trates los skills como acciones sueltas.** Recuerda el ciclo:

1. Mides con `outcomes` →
2. eso alimenta `factory-brain` (aprende) y `mission-control` (muestra) →
3. `acquisition` trae usuarios, `guardian` los cuida →
4. `cost-optimizer` mantiene rentable →
5. `vertical-pack` empaqueta lo bueno para el siguiente proyecto.

El valor de V5 está en el **ciclo completo**, no en los skills por separado.

---

*Mapa de relaciones del Loop Cerrado V5. Mantener actualizado si se agregan o cambian skills.*
