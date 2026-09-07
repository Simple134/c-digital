alter table public.kanban_cards
  add column if not exists client_comment text,
  add column if not exists client_evidence jsonb not null default '[]'::jsonb;

comment on column public.kanban_cards.client_comment is 'Nota que deja el cliente al marcar como completada una tarea que se le asignó.';
comment on column public.kanban_cards.client_evidence is 'Evidencia(s) subidas por el cliente al completar la tarea: array de {url, path} en el bucket kanban-attachments.';
