# Configuración de Supabase · paso a paso

Se hace una sola vez por ambiente. Tiempo total: unos 15 minutos.
Proyecto: `https://xeywtjnyoqqqmaomvfcd.supabase.co`

> **Regla de oro:** las llaves secretas solo van en la configuración del entorno o en
> `.env.local`. Nunca en el repositorio, en un chat ni en un correo.

---

## Parte 1 · Llaves (5 min)

**Para qué:** dejar solo las llaves que usa la app y anular cualquier llave que se haya expuesto.

Supabase → **Project Settings → API Keys**:

1. **Secret keys → Add new secret key.** Nómbrala `app-servidor` y guárdala en un lugar seguro.
   Borra cualquier secret key anterior que se haya compartido.
2. **Legacy API keys → Disable.** Apaga las llaves antiguas `eyJ…` (anon y service_role).
   La app usa el formato nuevo, así que no se rompe nada.
3. La **publishable key** (`sb_publishable_…`) es pública por diseño; se deja como está.

| Llave | Qué es | Riesgo si se expone |
|---|---|---|
| Publishable | Llave de la puerta principal; las reglas de acceso deciden qué se ve | Bajo |
| Secret | Llave maestra; se salta las reglas de acceso | **Alto: rotarla de inmediato** |

---

## Parte 2 · Base de datos (5 min)

**Para qué:** crear las tablas, las reglas de acceso y el almacenamiento privado de documentos y fotos.

Son dos migraciones y se corren en orden, cada una una sola vez:

| # | Archivo | Qué crea |
|---|---|---|
| 1 | `supabase/migrations/20261019000000_base.sql` | 7 tablas base, 8 fuentes oficiales, bucket privado `documentos` |
| 2 | `supabase/migrations/20261030000000_estudio.sql` | Flujo del estudio: checklist de documentos, checklist A–F, usos candidatos, análisis, bucket privado `fotos` |

Para cada una:

1. Abrir el archivo en GitHub y copiar todo el contenido.
2. Supabase → **SQL Editor → New query**, pegar y dar **Run**.
3. Debe decir *Success. No rows returned*.

**Verificar:** en **Table Editor** deben aparecer 11 tablas: `profiles`, `buildings`, `data_points`,
`documents`, `extractions`, `visit_notes`, `data_sources` (con 8 filas), `building_documents`,
`checklist_items`, `candidate_uses` y `analyses`. En **Storage** deben existir los buckets `documentos` y `fotos`, ambos privados.

> Si la migración base ya se corrió antes, solo hace falta la segunda.

---

## Parte 3 · Login (5 min)

**Para qué:** la app es solo por invitación.

En **Authentication**:

1. **Sign In / Providers:** desactivar *Allow new users to sign up*.
   Aunque alguien lograra registrarse, entra con rol `sin_acceso` y no ve datos.
2. **URL Configuration:**
   - *Site URL:* `http://localhost:3000` (cambiar por la URL de Vercel al publicar).
   - *Redirect URLs:* `http://localhost:3000/callback` (y luego `<URL de Vercel>/callback`).
3. **Emails → Templates**, reemplazar el enlace de cada plantilla:
   - *Invite user:* `{{ .SiteURL }}/callback?token_hash={{ .TokenHash }}&type=invite&next=/update-password`
   - *Reset password:* `{{ .SiteURL }}/callback?token_hash={{ .TokenHash }}&type=recovery&next=/update-password`
4. **Users → Add user → Create new user:** crear al primer administrador con correo y
   contraseña, dejando marcado *Auto Confirm User*. (Se crea directo y no por invitación
   porque el enlace de invitación abre la app, y la app aún no está publicada.)
5. **SQL Editor:** darle el rol de administrador (cambiar el correo):
   ```sql
   update public.profiles set role = 'admin' where email = 'correo@del-admin.com';
   ```
   Desde ahí, el admin invita al resto del equipo en la pantalla **Equipo** de la app.

---

## Parte 4 · Conectar el entorno de trabajo (3 min)

**Para qué:** que la app (y el asistente de desarrollo) puedan hablar con Supabase.

**En local:** copiar `.env.local.example` a `.env.local` y llenar las variables.

**En el entorno en la nube de Claude** (barra de título → nombre del entorno → **Edit**):
1. *Network access → Allowed domains:* agregar `*.supabase.co`
   (dejar marcado *Allow package managers*).
2. *Environment variables:*
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xeywtjnyoqqqmaomvfcd.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
   SUPABASE_SECRET_KEY=<secret key nueva>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NODE_USE_ENV_PROXY=1
   ```
   `NODE_USE_ENV_PROXY=1` hace que el servidor de la app salga a internet por el proxy del
   entorno en la nube. En un computador local no hace falta.
3. Guardar y **abrir una sesión nueva**: los cambios no aplican a sesiones ya abiertas.

Guía oficial de red: https://code.claude.com/docs/en/cloud-environments#network-access

---

## Parte 5 · Verificar

```bash
npm run check:supabase
```

Revisa, sin mostrar ninguna llave:
- que las variables estén definidas;
- que el proyecto responda;
- que existan las 11 tablas y las 8 fuentes oficiales;
- que la llave pública **no** pueda leer datos sin sesión (las reglas de acceso funcionan);
- que los dos buckets de archivos (documentos y fotos) sean privados.

Si todo sale ✅, la configuración está completa.
