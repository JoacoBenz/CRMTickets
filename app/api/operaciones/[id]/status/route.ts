import { NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { canTransition, type Status } from "@/lib/operaciones";

const VALID: Status[] = [
  "esperando_entrada",
  "entrada_recibida",
  "confirmada",
  "cancelada",
];

// PATCH /api/operaciones/[id]/status — cambia el estado respetando la
// máquina de estados. Requiere admin logueado; escribe con service role.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const to = body.status as Status;
  if (!VALID.includes(to)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  // Leemos el estado actual para validar la transición en el servidor.
  const { data: current, error: readErr } = await admin
    .from("operaciones")
    .select("status")
    .eq("id", params.id)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json(
      { error: "Operación no encontrada" },
      { status: 404 }
    );
  }

  const from = current.status as Status;
  if (!canTransition(from, to)) {
    return NextResponse.json(
      { error: `Transición no permitida: ${from} → ${to}` },
      { status: 409 }
    );
  }

  const { data, error } = await admin
    .from("operaciones")
    .update({ status: to })
    .eq("id", params.id)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, status: data.status });
}
