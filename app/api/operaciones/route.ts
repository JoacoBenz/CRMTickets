import { NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { generateCode } from "@/lib/operaciones";
import { getRol } from "@/lib/auth";

// Tope para columnas integer de Postgres (int4 max ~2.147MM), con margen.
const MAX_ARS = 2_000_000_000;

// POST /api/operaciones — crea una operación.
// Requiere un usuario con rol (moderador o administrador).
// La escritura va con service role y registra auditoría.
export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!getRol(user)) {
    return NextResponse.json(
      { error: "Tu usuario no tiene rol asignado" },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const evento = String(body.evento ?? "").trim();
  const comprador_alias = body.comprador_alias
    ? String(body.comprador_alias).trim()
    : null;
  const vendedor_alias = body.vendedor_alias
    ? String(body.vendedor_alias).trim()
    : null;
  const monto = Math.trunc(Number(body.monto));
  const fee = Math.trunc(Number(body.fee));

  if (!evento) {
    return NextResponse.json(
      { error: "El evento es obligatorio" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(monto) || monto < 0 || monto > MAX_ARS) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }
  if (!Number.isFinite(fee) || fee < 0 || fee > MAX_ARS) {
    return NextResponse.json({ error: "Comisión inválida" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  // Reintentos por si el code colisiona (muy improbable).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data, error } = await admin
      .from("operaciones")
      .insert({
        code,
        evento,
        comprador_alias,
        vendedor_alias,
        monto,
        fee,
        created_by: user.id,
      })
      .select("id, code")
      .single();

    if (!error && data) {
      // Auditoría: evento de creación (de null -> esperando_entrada).
      await admin.from("operacion_eventos").insert({
        operacion_id: data.id,
        de: null,
        a: "esperando_entrada",
        actor_id: user.id,
        actor_email: user.email ?? null,
      });

      return NextResponse.json({ id: data.id, code: data.code }, { status: 201 });
    }

    // 23505 = unique_violation (colisión de code). Reintentar.
    if (error && (error as any).code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "No se pudo generar un code único, reintentá" },
    { status: 500 }
  );
}
