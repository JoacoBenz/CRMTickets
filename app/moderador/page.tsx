import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { getRol } from "@/lib/auth";
import { getBaseUrl } from "@/lib/urls";
import ModeradorDashboard from "@/components/moderador/ModeradorDashboard";
import AppHeader from "@/components/AppHeader";
import AutoRefresh from "@/components/AutoRefresh";
import type { Operacion } from "@/lib/operaciones";

export const dynamic = "force-dynamic";

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
  const rol = getRol(user);
  if (!rol) {
    redirect("/sin-acceso");
  }

  // Últimas operaciones cargadas, para referencia y para copiar links.
  const { data } = await createAdminSupabase()
    .from("operaciones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const ops = (data ?? []) as Operacion[];

  return (
    <main className="min-h-dvh">
      <AutoRefresh intervalMs={15000} />
      <AppHeader
        subtitle="Carga de operaciones"
        email={user.email}
        action={
          rol === "administrador"
            ? { href: "/admin", label: "Ir al panel" }
            : undefined
        }
      />
      <ModeradorDashboard initial={ops} baseUrl={getBaseUrl()} />
    </main>
  );
}
