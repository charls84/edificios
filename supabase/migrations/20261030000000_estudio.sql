-- =====================================================================
-- Edificios · Flujo del estudio: checklist de documentos (Torna, 27-oct-2026),
-- checklist de la guia de mayor y mejor uso (bloques A-F), usos candidatos,
-- analisis (tamizaje y mayor y mejor uso) y fotos de visita en Storage.
-- Los catalogos (que documentos, que items) viven en el codigo:
-- src/features/estudio/catalogo/. Aqui solo se guarda el estado por edificio.
-- =====================================================================

-- ---------- Edificios: datos que la ficha ya muestra ----------
alter table public.buildings
  add column if not exists nombre text,
  add column if not exists zona text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists semaforo text check (semaforo in ('verde', 'amarillo', 'rojo')),
  add column if not exists resumen text,
  add column if not exists origen text,
  add column if not exists contacto text,
  add column if not exists notas text;

-- ---------- Documentos: archivo con nombre y tamano ----------
alter table public.documents
  add column if not exists nombre_archivo text,
  add column if not exists tamano integer,
  add column if not exists mime text;

-- ---------- Estado de cada documento de la checklist por edificio ----------
create table public.building_documents (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings on delete cascade,
  codigo text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'solicitado', 'cargado', 'validado', 'no_aplica')),
  notas text,
  updated_by uuid references public.profiles on delete set null,
  updated_at timestamptz not null default now(),
  unique (building_id, codigo)
);

-- ---------- Checklist de la guia (bloques A-F + prueba rapida) ----------
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings on delete cascade,
  codigo text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'cumple', 'no_cumple', 'por_verificar', 'no_aplica')),
  nota text,
  updated_by uuid references public.profiles on delete set null,
  updated_at timestamptz not null default now(),
  unique (building_id, codigo)
);

-- ---------- Usos candidatos (columnas de la matriz de decision) ----------
create table public.candidate_uses (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings on delete cascade,
  nombre text not null,
  categoria text not null default 'otros',
  orden integer not null default 0,
  -- Pruebas 1 a 3 (si / no / por_verificar)
  legal text not null default 'por_verificar' check (legal in ('si', 'no', 'por_verificar')),
  legal_nota text,
  fisico text not null default 'por_verificar' check (fisico in ('si', 'no', 'por_verificar')),
  fisico_nota text,
  demanda text not null default 'por_verificar' check (demanda in ('si', 'no', 'por_verificar')),
  demanda_nota text,
  -- Numeros (bloque F). Pesos en COP.
  m2_netos numeric(10, 2),
  canon_m2 numeric(12, 2),
  ocupacion numeric(4, 3) not null default 0.85 check (ocupacion between 0 and 1),
  inversion numeric(16, 2),
  gastos_anuales numeric(16, 2),
  meses_primer_ingreso integer,
  riesgo text not null default 'medio' check (riesgo in ('bajo', 'medio', 'alto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index candidate_uses_building_idx on public.candidate_uses (building_id);

-- ---------- Analisis corridos (se guarda cada corrida) ----------
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings on delete cascade,
  tipo text not null check (tipo in ('tamizaje', 'mayor_mejor_uso')),
  resultado jsonb not null,
  corrido_por uuid references public.profiles on delete set null,
  created_at timestamptz not null default now()
);
create index analyses_building_idx on public.analyses (building_id, tipo, created_at desc);

-- ---------- Visita tecnica: informe estructurado ----------
alter table public.visit_notes
  add column if not exists informe jsonb,
  alter column texto set default '';

-- ---------- RLS ----------
alter table public.building_documents enable row level security;
alter table public.checklist_items enable row level security;
alter table public.candidate_uses enable row level security;
alter table public.analyses enable row level security;

do $$
declare t text;
begin
  foreach t in array array['building_documents','checklist_items','candidate_uses','analyses']
  loop
    execute format('create policy "equipo lee" on public.%I for select using (public.is_team_member())', t);
    execute format('create policy "equipo crea" on public.%I for insert with check (public.is_team_member())', t);
    execute format('create policy "equipo edita" on public.%I for update using (public.is_team_member())', t);
    execute format('create policy "equipo borra" on public.%I for delete using (public.is_team_member())', t);
  end loop;
end $$;

-- Un analista puede quitar sus propios archivos y usos (no solo el admin)
drop policy if exists "admin borra" on public.documents;
create policy "equipo borra" on public.documents for delete using (public.is_team_member());

-- ---------- Storage: fotos de visita (privadas) ----------
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', false)
on conflict (id) do nothing;

create policy "equipo lee fotos" on storage.objects
  for select using (bucket_id = 'fotos' and public.is_team_member());
create policy "equipo sube fotos" on storage.objects
  for insert with check (bucket_id = 'fotos' and public.is_team_member());
create policy "equipo borra fotos" on storage.objects
  for delete using (bucket_id = 'fotos' and public.is_team_member());
drop policy if exists "admin borra documentos" on storage.objects;
create policy "equipo borra documentos" on storage.objects
  for delete using (bucket_id = 'documentos' and public.is_team_member());
