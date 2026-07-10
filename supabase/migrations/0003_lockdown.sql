-- AdminTickets — lockdown de escritura, máquina de estados y auditoría
--
-- Completa lo que 0002_public_read_rpc.sql dejó abierto:
-- 1) RLS pasa a denegar-todo en la tabla: se elimina también la lectura de
--    authenticated (op_auth_read) y las policies de escritura de 0001. Un
--    usuario logueado (p. ej. un moderador) podía saltarse la API con su
--    JWT y leer/escribir directo contra PostgREST, incluyendo cambios de
--    estado inválidos. La página pública sigue leyendo vía el RPC
--    operacion_publica (security definer, no depende de policies); los
--    paneles y las APIs leen y escriben en el servidor con la service
--    role, que valida sesión y rol.
-- 2) Trigger que valida la máquina de estados en Postgres (la invariante
--    queda garantizada sin importar quién escriba).
-- 3) created_by en operaciones + tabla de auditoría operacion_eventos.

-- ---------------------------------------------------------------
-- 1) Deny-all: sin policies, anon y authenticated no ven ni tocan nada.
drop policy if exists "op_public_read" on public.operaciones;
drop policy if exists "op_auth_read" on public.operaciones;
drop policy if exists "op_admin_insert" on public.operaciones;
drop policy if exists "op_admin_update" on public.operaciones;
drop policy if exists "op_admin_delete" on public.operaciones;

-- RLS sigue habilitado (deny-all por defecto). Refuerzo por si acaso:
alter table public.operaciones enable row level security;

-- ---------------------------------------------------------------
-- 2) Máquina de estados en la base.
--    esperando_entrada -> entrada_recibida -> confirmada
--    no-terminal -> cancelada; cancelada -> esperando_entrada (reabrir).
create or replace function public.validar_transicion_status()
returns trigger
language plpgsql
as $$
begin
  -- Updates que no tocan el estado pasan de largo.
  if new.status = old.status then
    return new;
  end if;

  if (old.status = 'esperando_entrada' and new.status in ('entrada_recibida', 'cancelada'))
     or (old.status = 'entrada_recibida' and new.status in ('confirmada', 'cancelada'))
     or (old.status = 'cancelada' and new.status = 'esperando_entrada')
  then
    return new;
  end if;

  raise exception 'Transición de estado no permitida: % -> %', old.status, new.status
    using errcode = 'P0001';
end;
$$;

drop trigger if exists trg_operaciones_validar_status on public.operaciones;
create trigger trg_operaciones_validar_status
  before update of status on public.operaciones
  for each row
  execute function public.validar_transicion_status();

-- ---------------------------------------------------------------
-- 3) Quién creó cada operación + historial de cambios de estado.
alter table public.operaciones
  add column if not exists created_by uuid references auth.users (id);

create table if not exists public.operacion_eventos (
  id bigint generated always as identity primary key,
  operacion_id uuid not null references public.operaciones (id) on delete cascade,
  de operacion_status,                -- null = creación
  a operacion_status not null,
  actor_id uuid,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists operacion_eventos_op_idx
  on public.operacion_eventos (operacion_id, created_at);

-- Deny-all también acá: solo la service role escribe/lee auditoría.
alter table public.operacion_eventos enable row level security;
