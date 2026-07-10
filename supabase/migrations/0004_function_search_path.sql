-- Fija search_path en las funciones de trigger (security advisor 0011):
-- evita que un search_path manipulado redirija referencias dentro de la
-- función. operacion_publica ya lo fija en su definición (0002).
alter function public.set_updated_at() set search_path = public;
alter function public.validar_transicion_status() set search_path = public;
