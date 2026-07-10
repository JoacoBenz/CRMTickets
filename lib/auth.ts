import type { User } from "@supabase/supabase-js";

// Roles de la app:
// - administrador: gestiona operaciones (ver lista, avanzar/cancelar estados)
//   y también puede cargar.
// - moderador: solo carga operaciones nuevas y comparte el link.
//
// El rol se guarda en app_metadata.role del usuario de Supabase (no editable
// por el propio usuario). Un usuario SIN rol asignado NO tiene acceso a
// ningún módulo: así una cuenta creada por fuera (p. ej. un signup que quedó
// habilitado) no obtiene permisos por accidente. Ver README para asignar
// roles y para desactivar los signups públicos.
export type Rol = "administrador" | "moderador";

export function getRol(user: User): Rol | null {
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.[
    "role"
  ];
  if (role === "administrador" || role === "moderador") {
    return role;
  }
  return null;
}
