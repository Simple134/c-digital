create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  invited_by uuid references public.client_contacts(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index client_contacts_email_idx on public.client_contacts (lower(email));
create index client_contacts_client_id_idx on public.client_contacts (client_id, created_at);

comment on table public.client_contacts is 'Contactos (logins) de un cliente: varias personas pueden acceder al mismo /panel y ver los mismos proyectos.';
comment on column public.client_contacts.auth_user_id is 'Null mientras el contacto solo fue invitado y no se ha registrado.';
comment on column public.client_contacts.invited_by is 'Contacto que envió la invitación, si aplica (null = alta hecha por el equipo o registro público).';
comment on column public.client_contacts.accepted_at is 'Cuándo completó su registro. Null = invitación pendiente.';

alter table public.client_contacts enable row level security;

create policy "auth all client_contacts" on public.client_contacts
  for all to authenticated
  using (is_team_member())
  with check (is_team_member());

-- Migra los logins existentes de `clients.auth_user_id` a su primer contacto,
-- para que ningún cliente actual note el cambio.
insert into public.client_contacts (client_id, auth_user_id, name, email, accepted_at, created_at)
select id, auth_user_id, coalesce(nullif(trim(contact_name), ''), name), email, created_at, created_at
from public.clients
where auth_user_id is not null and email is not null;
