"use client";

import { useState } from "react";
import type { Operacion } from "@/lib/operaciones";

type Props = {
  onCreated: (op: Operacion) => void;
  onError: (msg: string) => void;
};

const empty = {
  evento: "",
  comprador_alias: "",
  vendedor_alias: "",
  monto: "",
  fee: "",
};

// Formulario "Nueva operación".
export default function NewOperacionForm({ onCreated, onError }: Props) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.evento.trim()) {
      onError("El evento es obligatorio");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/operaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evento: form.evento,
          comprador_alias: form.comprador_alias || null,
          vendedor_alias: form.vendedor_alias || null,
          monto: Number(form.monto || 0),
          fee: Number(form.fee || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "No se pudo crear la operación");
        return;
      }

      // Construimos el objeto local para pintar la card al instante.
      const now = new Date().toISOString();
      onCreated({
        id: data.id,
        code: data.code,
        evento: form.evento.trim(),
        comprador_alias: form.comprador_alias.trim() || null,
        vendedor_alias: form.vendedor_alias.trim() || null,
        monto: Math.trunc(Number(form.monto || 0)),
        fee: Math.trunc(Number(form.fee || 0)),
        status: "esperando_entrada",
        created_at: now,
        updated_at: now,
      });
      setForm(empty);
    } catch {
      onError("Error de red al crear la operación");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[#D7DAE4] bg-white px-3 py-2 text-sm outline-none focus:border-brand";
  const labelCls = "mb-1 block text-xs font-medium text-[#6A6E7E]";

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-2xl bg-white shadow-card"
    >
      {/* Cabecera violeta estilo stub */}
      <div className="relative bg-brand px-5 py-3.5 text-white">
        <h2 className="font-display text-base font-semibold">Nueva operación</h2>
        <span
          className="perf-notch left"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          aria-hidden
        />
        <span
          className="perf-notch right"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          aria-hidden
        />
      </div>

      <div className="space-y-3 p-5">
        <div>
          <label htmlFor="evento" className={labelCls}>
            Evento
          </label>
          <input
            id="evento"
            className={inputCls}
            value={form.evento}
            onChange={(e) => set("evento", e.target.value)}
            placeholder="River vs Boca — Superclásico"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="comprador" className={labelCls}>
              Alias comprador
            </label>
            <input
              id="comprador"
              className={inputCls}
              value={form.comprador_alias}
              onChange={(e) => set("comprador_alias", e.target.value)}
              placeholder="compra_marce"
            />
          </div>
          <div>
            <label htmlFor="vendedor" className={labelCls}>
              Alias vendedor
            </label>
            <input
              id="vendedor"
              className={inputCls}
              value={form.vendedor_alias}
              onChange={(e) => set("vendedor_alias", e.target.value)}
              placeholder="vende_lucho"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="monto" className={labelCls}>
              Monto (ARS)
            </label>
            <input
              id="monto"
              type="number"
              min={0}
              inputMode="numeric"
              className={inputCls}
              value={form.monto}
              onChange={(e) => set("monto", e.target.value)}
              placeholder="85000"
            />
          </div>
          <div>
            <label htmlFor="fee" className={labelCls}>
              Comisión (ARS)
            </label>
            <input
              id="fee"
              type="number"
              min={0}
              inputMode="numeric"
              className={inputCls}
              value={form.fee}
              onChange={(e) => set("fee", e.target.value)}
              placeholder="6000"
            />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creando…" : "Crear operación"}
        </button>
      </div>
    </form>
  );
}
