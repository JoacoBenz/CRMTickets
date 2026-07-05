import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import StatusStub from "@/components/StatusStub";
import AutoRefresh from "@/components/AutoRefresh";
import type { OperacionPublica, Status } from "@/lib/operaciones";

// Página pública read-only. Se accede por el uuid (impredecible).
// Muestra SOLO campos seguros: evento, monto, fee, estado, aliases y fecha.
export const dynamic = "force-dynamic";

// Validación básica de uuid v4/genérico para no consultar con basura.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OperacionPublicaPage({
  params,
}: {
  params: { id: string };
}) {
  if (!UUID_RE.test(params.id)) {
    notFound();
  }

  const supabase = createServerSupabase();

  // Seleccionamos SOLO los campos públicos. Nada de contacto, comisión ni
  // id incremental.
  const { data, error } = await supabase
    .from("operaciones")
    .select(
      "code, evento, comprador_alias, vendedor_alias, monto, status, updated_at"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const op: OperacionPublica = {
    ...data,
    status: data.status as Status,
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-8">
      <AutoRefresh />
      <StatusStub op={op} />
      <footer className="mt-6 text-center text-xs text-[#9A9EAE]">
        Resguardo · custodia de operaciones
      </footer>
    </main>
  );
}
