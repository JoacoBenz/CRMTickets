import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRol } from "@/lib/auth";
import ModeradorDashboard from "@/components/moderador/ModeradorDashboard";
import AppHeader from "@/components/AppHeader";
import type { Operacion } from "@/lib/operaciones";

export const dynamic = "force-dynamic";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// Módulo del moderador: carga la entrada a vender con los datos de
// comprador y vendedor. También lo puede usar el admin para cargar.
export default async function ModeradorPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const esAdmin = getRol(user) === "administrador";

  // Últimas operaciones cargadas, para referencia y para copiar links.
  const { data } = await supabase
    .from("operaciones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const ops = (data ?? []) as Operacion[];

  return (
    <main className="min-h-dvh bg-canvas">
      <AppHeader
        subtitle="Carga de operaciones"
        email={user.email}
        action={esAdmin ? { href: "/admin", label: "Ir al panel" } : undefined}
      />
      <ModeradorDashboard initial={ops} baseUrl={getBaseUrl()} />
    </main>
  );
}
