-- Link de pago (Stripe vía Gestiono) para facturas de Supabase.
--
-- Guardamos ambos campos y no solo la URL: `gestiono_pending_record_id` es lo
-- que permite volver a pedirle el link a Gestiono o consultar el estado de la
-- factura espejo. Si solo guardáramos la URL y esta expirara, no habría forma
-- de recuperar a qué factura de Gestiono corresponde, y el próximo clic
-- duplicaría la factura en la contabilidad.
alter table public.invoices
  add column if not exists gestiono_pending_record_id bigint,
  add column if not exists gestiono_share_url text,
  add column if not exists gestiono_linked_at timestamptz;

-- El monto por el que se generó el link. Se congela porque la respuesta a
-- "¿cuánto cobra este link?" no se puede derivar después: si el cliente abona
-- algo más, el saldo actual ya no es el que el link cobra.
alter table public.invoices
  add column if not exists gestiono_link_amount numeric(14, 2);

-- Una factura de Supabase espeja a lo sumo una de Gestiono.
create unique index if not exists invoices_gestiono_pending_record_id_key
  on public.invoices (gestiono_pending_record_id)
  where gestiono_pending_record_id is not null;
