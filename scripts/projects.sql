-- Proyectos por cliente.
--
-- El cliente sigue siendo la identidad de acceso al panel (`clients.auth_user_id`).
-- Un proyecto agrupa el trabajo operativo: tareas, facturas, archivos y
-- reuniones. `project_id` queda nullable para no romper el historial existente.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  slug text,
  status text not null default 'activo'
    check (status in ('activo', 'pausado', 'completado', 'archivado')),
  description text,
  started_at date,
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_client_id_idx
  on public.projects (client_id, sort_order, name);

create unique index if not exists projects_client_slug_key
  on public.projects (client_id, slug)
  where slug is not null;

alter table public.kanban_cards
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.invoices
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.client_files
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.meeting_requests
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists kanban_cards_project_id_idx
  on public.kanban_cards (project_id, sort_order);

create index if not exists invoices_project_id_idx
  on public.invoices (project_id, issued_at desc);

create index if not exists client_files_project_id_idx
  on public.client_files (project_id, created_at desc);

create index if not exists meeting_requests_project_id_idx
  on public.meeting_requests (project_id, created_at desc);

-- RLS compatible con el resto del dashboard: el equipo gestiona todos los
-- proyectos; el cliente autenticado solo lee proyectos vinculados a su fila.
alter table public.projects enable row level security;

drop policy if exists "team write projects" on public.projects;
create policy "team write projects"
  on public.projects
  for all
  using (public.is_team_member())
  with check (public.is_team_member());

drop policy if exists "client read own projects" on public.projects;
create policy "client read own projects"
  on public.projects
  for select
  using (
    exists (
      select 1
      from public.clients c
      where c.id = projects.client_id
        and c.auth_user_id = auth.uid()
    )
  );

