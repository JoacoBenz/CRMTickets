"use client";

import { useMemo, useState } from "react";
import { nextStatus, type Operacion, type Status } from "@/lib/operaciones";
import NewOperacionForm from "./NewOperacionForm";
import OperacionCard from "./OperacionCard";
import { ToastViewport, useToast } from "./Toast";

type Props = {
  initial: Operacion[];
  baseUrl: string;
};

// Panel del admin: mantiene el estado local de la lista y coordina
// creación, avance y cambios de estado (todo vía Route Handlers).
export default function AdminDashboard({ initial, baseUrl }: Props) {
  const [ops, setOps] = useState<Operacion[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, push } = useToast();

  const stats = useMemo(() => {
    const enCurso = ops.filter(
      (o) => o.status === "esperando_entrada" || o.status === "entrada_recibida"
    ).length;
    const confirmadas = ops.filter((o) => o.status === "confirmada").length;
    return { enCurso, confirmadas, total: ops.length };
  }, [ops]);

  function replaceOp(id: string, status: Status) {
    setOps((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status, updated_at: new Date(o.updated_at).toISOString() }
          : o
      )
    );
  }

  async function changeStatus(op: Operacion, to: Status, okMsg: string) {
    setBusyId(op.id);
    try {
      const res = await fetch(`/api/operaciones/${op.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to }),
      });
      const data = await res.json();
      if (!res.ok) {
        push("error", data.error ?? "No se pudo actualizar el estado");
        return;
      }
      replaceOp(op.id, data.status as Status);
      push("success", okMsg);
    } catch {
      push("error", "Error de red al actualizar");
    } finally {
      setBusyId(null);
    }
  }

  function onAdvance(op: Operacion) {
    const to = nextStatus(op.status);
    if (!to) return;
    const msg =
      to === "entrada_recibida" ? "Entrada recibida" : "Pago confirmado";
    changeStatus(op, to, msg);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Mini stats: tira única estilo talón, dividida por líneas punteadas */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="grid grid-cols-3 divide-x divide-dashed divide-[#E3E5ED]">
          <Stat label="En curso" value={stats.enCurso} accent="#C7891A" />
          <Stat label="Confirmadas" value={stats.confirmadas} accent="#0E9B82" />
          <Stat label="Totales" value={stats.total} accent="#5B4BE0" />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_1fr]">
        {/* Columna izquierda: form */}
        <div className="md:sticky md:top-6 md:self-start">
          <NewOperacionForm
            onCreated={(op) => {
              setOps((prev) => [op, ...prev]);
              push("success", `Operación ${op.code} creada`);
            }}
            onError={(m) => push("error", m)}
          />
        </div>

        {/* Columna derecha: lista */}
        <div className="space-y-3">
          {ops.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C7CAD6] bg-white/50 px-4 py-10 text-center text-sm text-[#8A8FA0]">
              Todavía no hay operaciones. Creá la primera desde el formulario.
            </div>
          ) : (
            ops.map((op) => (
              <OperacionCard
                key={op.id}
                op={op}
                baseUrl={baseUrl}
                busy={busyId === op.id}
                onAdvance={onAdvance}
                onCancel={(o) =>
                  changeStatus(o, "cancelada", "Operación cancelada")
                }
                onReopen={(o) =>
                  changeStatus(o, "esperando_entrada", "Operación reabierta")
                }
                onCopied={(m) => push("success", m)}
              />
            ))
          )}
        </div>
      </div>

      <ToastViewport toasts={toasts} />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="px-4 py-4 text-center sm:text-left">
      <p className="text-[11px] font-medium uppercase tracking-widest text-[#8A8FA0]">
        {label}
      </p>
      <p
        className="mt-0.5 font-display text-3xl font-bold tabular-nums"
        style={{ color: accent }}
      >
        {String(value).padStart(2, "0")}
      </p>
    </div>
  );
}
