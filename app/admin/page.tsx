import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";
import LogoutButton from "@/components/admin/LogoutButton";
import type { Operacion } from "@/lib/operaciones";

export const dynamic = "force-dynamic";

// Deriva la URL base para armar los links públicos.
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function AdminPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Refuerzo por si el middleware no corrió (defensa en profundidad).
  if (!user) {
    redirect("/admin/login");
  }

  const { data } = await supabase
    .from("operaciones")
    .select("*")
    .order("created_at", { ascending: false });

  const ops = (data ?? []) as Operacion[];
  const baseUrl = getBaseUrl();

  return (
    <main className="min-h-dvh bg-canvas">
      <header
        className="border-b-2 border-dashed border-white/10 text-white"
        style={{
          background:
            "linear-gradient(150deg, #262a45 0%, #1B1D29 60%, #16171e 100%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-brand" />
            <span className="font-display text-lg font-bold">Resguardo</span>
            <span className="hidden text-sm text-white/50 sm:inline">
              · Custodia de operaciones
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-white/50 sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <AdminDashboard initial={ops} baseUrl={baseUrl} />
    </main>
  );
}
