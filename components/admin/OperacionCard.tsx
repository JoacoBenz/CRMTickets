"use client";

import {
  STATUS_COLOR,
  formatARS,
  nextStatus,
  nextStatusLabel,
  whatsappMessage,
  type Operacion,
} from "@/lib/operaciones";
import StatusChip from "@/components/StatusChip";

type Props = {
  op: Operacion;
  baseUrl: string;
  busy: boolean;
  onAdvance: (op: Operacion) => void;
  onCancel: (op: Operacion) => void;
  onReopen: (op: Operacion) => void;
  onCopied: (text: string) => void;
};

// Card de una operación en el panel admin, con el botón de "un toque".
export default function OperacionCard({
  op,
  baseUrl,
  busy,
  onAdvance,
  onCancel,
  onReopen,
  onCopied,
}: Props) {
  const link = `${baseUrl}/op/${op.id}`;
  const advanceLabel = nextStatusLabel(op.status);
  const hasNext = nextStatus(op.status) !== null;

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      onCopied(label);
    } catch {
      onCopied("No se pudo copiar");
    }
  }

  return (
    <article className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-[#8A8FA0]">{op.code}</p>
          <h3 className="mt-0.5 truncate font-display text-lg font-semibold">
            {op.evento}
          </h3>
        </div>
        <StatusChip status={op.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className="font-display text-base font-semibold">
          {formatARS(op.monto)}
        </span>
        <span className="text-[#8A8FA0]">
          + {formatARS(op.fee)} comisión
        </span>
      </div>

      {(op.comprador_alias || op.vendedor_alias) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6A6E7E]">
          {op.comprador_alias && (
            <span>
              Comprador: <span className="font-medium">{op.comprador_alias}</span>
            </span>
          )}
          {op.vendedor_alias && (
            <span>
              Vendedor: <span className="font-medium">{op.vendedor_alias}</span>
            </span>
          )}
        </div>
      )}

      {/* Botón primario de un toque */}
      {hasNext && advanceLabel && (
        <button
          onClick={() => onAdvance(op)}
          disabled={busy}
          className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: STATUS_COLOR[nextStatus(op.status)!] }}
        >
          {advanceLabel}
        </button>
      )}

      {/* Botones secundarios */}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-[#D7DAE4] px-3 py-1.5 text-xs font-medium text-[#4A4E5E] transition-colors hover:bg-canvas"
        >
          Ver
        </a>
        <button
          onClick={() => copy(link, "Link copiado")}
          className="rounded-lg border border-[#D7DAE4] px-3 py-1.5 text-xs font-medium text-[#4A4E5E] transition-colors hover:bg-canvas"
        >
          Copiar link
        </button>
        <button
          onClick={() =>
            copy(whatsappMessage(op.evento, link), "Mensaje de WhatsApp copiado")
          }
          className="rounded-lg border border-[#D7DAE4] px-3 py-1.5 text-xs font-medium text-[#4A4E5E] transition-colors hover:bg-canvas"
        >
          Copiar WhatsApp
        </button>

        {op.status === "cancelada" ? (
          <button
            onClick={() => onReopen(op)}
            disabled={busy}
            className="rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/5 disabled:opacity-60"
          >
            Reabrir
          </button>
        ) : (
          op.status !== "confirmada" && (
            <button
              onClick={() => onCancel(op)}
              disabled={busy}
              className="rounded-lg border border-estado-cancelada px-3 py-1.5 text-xs font-semibold text-estado-cancelada transition-colors hover:bg-estado-cancelada/5 disabled:opacity-60"
            >
              Cancelar
            </button>
          )
        )}
      </div>
    </article>
  );
}
