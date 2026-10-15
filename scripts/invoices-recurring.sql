-- Pagos recurrentes: cuota fija y días del mes en que se cobra (15, 30...).
-- `pay_days` vacío = factura sin recurrencia (se usa solo `due_date`).
alter table invoices add column if not exists installment_amount numeric(12,2);
alter table invoices add column if not exists pay_days int[] not null default '{}';
-- Último día en que se mandó el correo de cuota; evita duplicados el mismo día.
alter table invoices add column if not exists last_installment_on date;
