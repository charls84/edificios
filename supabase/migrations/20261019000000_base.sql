-- =====================================================================
-- Edificios · Fase 1 (ficha del edificio) · esquema base
-- Ver BUSINESS_LOGIC.md, seccion 7. Llave principal del predio: CHIP.
-- Datos personales (certificados de tradicion): Ley 1581 de 2012.
-- RLS activo en TODAS las tablas; solo el equipo invitado ve datos.
-- =====================================================================

create extension if not exists postgis with schema extensions;

-- ---------- Tipos ----------
create type public.rol as enum ('sin_acceso', 'analista', 'admin');
create type public.etapa as enum (
  'identificado', 'en_analisis', 'presentado', 'descartado', 'en_intervencion'
);
create type public.estado_dato as enum ('automatico', 'por_validar', 'validado');
create type public.tipo_fuente as enum ('api', 'descarga', 'manual');

-- ---------- Perfiles ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  -- Todo usuario nuevo nace sin acceso; solo la invitacion de un admin le da rol.
  role public.rol not null default 'sin_acceso',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helpers de acceso (security definer para no recursar en RLS de profiles)
create or replace function public.is_team_member()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('analista', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- Catalogo de fuentes ----------
create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  entidad text not null,
  url text,
  licencia text,
  tipo public.tipo_fuente not null
);

-- ---------- Edificios ----------
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  chip text unique,
  direccion text not null,
  matricula_inmobiliaria text,
  geom extensions.geometry(MultiPolygon, 4326),
  etapa public.etapa not null default 'identificado',
  puntaje numeric(5, 2),
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index buildings_geom_idx on public.buildings using gist (geom);
create index buildings_etapa_idx on public.buildings (etapa);

-- ---------- Datos de la ficha (cada uno con fuente y fecha) ----------
create table public.data_points (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings on delete cascade,
  categoria text not null,
  clave text not null,
  valor jsonb not null,
  source_id uuid references public.data_sources on delete restrict,
  fecha_consulta timestamptz not null default now(),
  estado public.estado_dato not null default 'automatico',
  validado_por uuid references public.profiles on delete set null,
  unique (building_id, categoria, clave)
);

-- ---------- Documentos cargados ----------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings on delete cascade,
  tipo text not null,
  storage_path text not null unique,
  cargado_por uuid references public.profiles on delete set null,
  fecha timestamptz not null default now()
);

-- ---------- Campos extraidos por IA (siempre con pagina) ----------
create table public.extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents on delete cascade,
  campo text not null,
  valor text,
  pagina int not null check (pagina > 0),
  confianza numeric(3, 2) check (confianza between 0 and 1),
  estado public.estado_dato not null default 'por_validar',
  validado_por uuid references public.profiles on delete set null
);

-- ---------- Notas y fotos de visita ----------
create table public.visit_notes (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings on delete cascade,
  autor uuid references public.profiles on delete set null,
  texto text not null,
  fotos text[] not null default '{}',
  fecha timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.data_sources enable row level security;
alter table public.buildings enable row level security;
alter table public.data_points enable row level security;
alter table public.documents enable row level security;
alter table public.extractions enable row level security;
alter table public.visit_notes enable row level security;

-- Perfiles: cada uno ve el suyo; el equipo ve a todo el equipo.
create policy "ver perfil propio o del equipo" on public.profiles
  for select using (id = auth.uid() or public.is_team_member());
create policy "editar perfil propio" on public.profiles
  for update using (id = auth.uid());
-- El rol solo lo cambia el servidor (service role); el usuario solo su nombre.
revoke update on public.profiles from authenticated;
grant update (full_name, updated_at) on public.profiles to authenticated;

-- Tablas de trabajo: el equipo lee y escribe; solo admin borra.
do $$
declare t text;
begin
  foreach t in array array['data_sources','buildings','data_points','documents','extractions','visit_notes']
  loop
    execute format('create policy "equipo lee" on public.%I for select using (public.is_team_member())', t);
    execute format('create policy "equipo crea" on public.%I for insert with check (public.is_team_member())', t);
    execute format('create policy "equipo edita" on public.%I for update using (public.is_team_member())', t);
    execute format('create policy "admin borra" on public.%I for delete using (public.is_admin())', t);
  end loop;
end $$;

-- ---------- Storage: documentos privados ----------
insert into storage.buckets (id, name, public) values ('documentos', 'documentos', false)
on conflict (id) do nothing;

create policy "equipo lee documentos" on storage.objects
  for select using (bucket_id = 'documentos' and public.is_team_member());
create policy "equipo sube documentos" on storage.objects
  for insert with check (bucket_id = 'documentos' and public.is_team_member());
create policy "admin borra documentos" on storage.objects
  for delete using (bucket_id = 'documentos' and public.is_admin());

-- ---------- Fuentes oficiales (BUSINESS_LOGIC.md, seccion 5) ----------
insert into public.data_sources (nombre, entidad, url, licencia, tipo) values
  ('Catastro Bogotá', 'UAECD / IDECA', 'https://datosabiertos.bogota.gov.co', 'Datos abiertos', 'descarga'),
  ('POT Decreto 555 de 2021', 'SDP', 'https://datosabiertos.bogota.gov.co/dataset/pot-decreto-555-de-2021-bogota-d-c', 'Datos abiertos', 'descarga'),
  ('Bienes de Interés Cultural', 'IDPC / Catastro', 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/recreaciondeporte/bienesinterescultural/MapServer', 'Servicio GIS público', 'api'),
  ('PEMP Centro Histórico', 'IDPC', null, 'Datos abiertos', 'descarga'),
  ('Licencias de construcción', 'SINUPOT / Curadurías', null, 'Consulta web', 'manual'),
  ('Certificado de tradición y libertad', 'SNR', null, 'Pago por certificado', 'manual'),
  ('Amenaza y riesgo', 'POT 555 / IDIGER', null, 'Datos abiertos', 'descarga'),
  ('Visita técnica', 'Equipo propio', null, null, 'manual');
