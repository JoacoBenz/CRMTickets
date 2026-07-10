-- Campo "cuenta a debitar" en la operación: de qué cuenta (alias/CBU) se
-- debita la plata. Dato interno del panel — NO se expone en el RPC público.
alter table public.operaciones
  add column if not exists cuenta_debitar text;
