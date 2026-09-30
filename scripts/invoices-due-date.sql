-- Fecha límite de pago de cada factura. Nullable: las facturas anteriores
-- quedan sin fecha y el portal simplemente no muestra "vence".
alter table invoices add column if not exists due_date date;

-- Etapas de recordatorio por correo ya enviadas (5, 1 y 0 días antes de la
-- fecha de pago), para no repetir el mismo aviso.
alter table invoices add column if not exists reminders_sent int[] not null default '{}';
