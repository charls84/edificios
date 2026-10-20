# Puesta en marcha de Supabase

Pasos para conectar la base de datos. Se hacen una sola vez por ambiente.

1. **Crear el proyecto** en supabase.com (región São Paulo, la más cercana a Bogotá).
2. **Variables:** copiar `.env.local.example` a `.env.local` y llenar la URL, la
   *publishable key* y la *secret key* (Settings → API Keys). La secret key es solo de
   servidor; nunca va al navegador, al repositorio ni a un chat.
3. **Aplicar la migración** `supabase/migrations/20261019000000_base.sql`
   (SQL Editor, o `supabase db push`).
4. **Cerrar el registro público:** Authentication → Sign In / Providers → desactivar
   *Allow new users to sign up*. Aunque alguien se registrara, entra con rol `sin_acceso`
   y no ve datos; esto es la segunda barrera.
5. **URLs:** Authentication → URL Configuration → Site URL = URL de la app;
   Redirect URLs = `<URL>/callback`.
6. **Plantillas de correo** (Authentication → Email Templates), para que los enlaces pasen
   por el servidor:
   - *Invite user:* `{{ .SiteURL }}/callback?token_hash={{ .TokenHash }}&type=invite&next=/update-password`
   - *Reset password:* `{{ .SiteURL }}/callback?token_hash={{ .TokenHash }}&type=recovery&next=/update-password`
7. **Primer administrador:** invitarlo desde Authentication → Users → Invite, y luego en el
   SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'correo@del-admin.com';
   ```
   Desde ahí, el admin invita al resto del equipo desde la pantalla **Equipo**.
