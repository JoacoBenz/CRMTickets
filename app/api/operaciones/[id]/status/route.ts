import { NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { canTransition, type Status } from "@/lib/operaciones";
import { getRol } from "@/lib/auth";
import { UUID_RE } from "@/lib/urls";

const VALID: Status[] = [
  "esperando_entrada",
  "entrada_recibida",
  "confirmada",
  "cancelada",
];

// PATCH /api/operaciones/[id]/status — cambia el estado respetando la
// máquina de estados. Solo administrador; escribe con service role.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Los moderadores solo cargan operaciones; el estado lo maneja el admin.
  if (getRol(user) !== "administrador") {
    return NextResponse.json(
      { error: "Solo el administrador puede cambiar estados" },
      { status: 403 }
    );
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

  // Leemos el estado actual para validar la transición y dar buen error.
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

  // Update CONDICIONAL al estado leído: si otro request cambió el estado
  // entre la lectura y la escritura, no matchea ninguna fila y devolvemos
  // 409 en vez de pisar el cambio ajeno (sin carrera leer-validar-escribir).
  const { data, error } = await admin
    .from("operaciones")
    .update({ status: to })
    .eq("id", params.id)
    .eq("status", from)
    .select("id, status")
    .maybeSingle();

  if (error) {
    // P0001 = el trigger de la base rechazó la transición (doble defensa).
    const status = (error as any).code === "P0001" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  if (!data) {
    return NextResponse.json(
      { error: "La operación cambió de estado, actualizá la página" },
      { status: 409 }
    );
  }

  // Auditoría: quién hizo la transición y cuándo.
  await admin.from("operacion_eventos").insert({
    operacion_id: data.id,
    de: from,
    a: to,
    actor_id: user.id,
    actor_email: user.email ?? null,
  });

  return NextResponse.json({ id: data.id, status: data.status });
}
