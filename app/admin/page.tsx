import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { getRol } from "@/lib/auth";
import { getBaseUrl } from "@/lib/urls";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AppHeader from "@/components/AppHeader";
import AutoRefresh from "@/components/AutoRefresh";
import type { Operacion } from "@/lib/operaciones";

export const dynamic = "force-dynamic";

// Módulo del administrador: chequea y actualiza los estados.
export default async function AdminPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Refuerzo por si el middleware no corrió (defensa en profundidad).
  if (!user) {
    redirect("/admin/login");
  }
  const rol = getRol(user);
  if (!rol) {
    redirect("/sin-acceso");
  }
  if (rol !== "administrador") {
    redirect("/moderador");
  }

  // Con RLS en deny-all, la lectura va con service role (ya validamos rol).
  const { data } = await createAdminSupabase()
    .from("operaciones")
    .select("*")
    .order("created_at", { ascending: false });

  const ops = (data ?? []) as Operacion[];

  return (
    <main className="min-h-dvh">
      {/* El panel también se refresca solo: si el moderador carga una
          operación, aparece acá sin recargar a mano. */}
      <AutoRefresh intervalMs={15000} />
      <AppHeader
        subtitle="Administración"
        email={user.email}
        action={{ href: "/moderador", label: "＋ Cargar operación" }}
      />
      <AdminDashboard initial={ops} baseUrl={getBaseUrl()} />
    </main>
  );
}
