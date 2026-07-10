import { headers } from "next/headers";

// URL base para armar los links públicos de las operaciones.
// En producción conviene fijar NEXT_PUBLIC_SITE_URL (los headers
// x-forwarded-* dependen de la plataforma); en local se deriva del host.
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// Validación de uuid para no pegarle a la base con basura
// (y devolver 400/404 en vez de un error crudo de Postgres).
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
