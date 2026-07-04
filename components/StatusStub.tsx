import {
  STATUS_COLOR,
  STATUS_LABEL,
  formatARS,
  type OperacionPublica,
} from "@/lib/operaciones";
import ProgressSteps from "./ProgressSteps";

// Talón / stub de entrada. Encabezado oscuro con evento + code, línea de
// troquelado, y un "sello" grande con el estado.
export default function StatusStub({ op }: { op: OperacionPublica }) {
  const color = STATUS_COLOR[op.status];
  const actualizado = new Date(op.updated_at).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        {/* Encabezado oscuro */}
        <div className="relative bg-[#1B1D29] px-6 pb-9 pt-7 text-white">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/60">
            <span
              className="inline-block h-2 w-2 rounded-full bg-brand"
              aria-hidden
            />
            Resguardo · Custodia
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold leading-tight">
            {op.evento}
          </h1>
          <p className="mt-2 font-mono text-sm text-white/70">{op.code}</p>

          {/* Muescas del troquelado */}
          <span className="perf-notch left" aria-hidden />
          <span className="perf-notch right" aria-hidden />
        </div>

        {/* Línea de troquelado */}
        <div className="relative bg-[#1B1D29]">
          <div className="perf-line mx-6" />
        </div>

        {/* Sello de estado */}
        <div className="bg-[#1B1D29] px-6 pb-7 pt-8">
          <div
            className="mx-auto flex w-full flex-col items-center rounded-2xl border-2 py-6"
            style={{
              borderColor: color,
              backgroundColor: `${color}1F`,
            }}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-white/60">
              Estado
            </span>
            <span
              className="mt-1 font-display text-3xl font-bold"
              style={{ color }}
            >
              {STATUS_LABEL[op.status]}
            </span>
          </div>
        </div>

        {/* Cuerpo blanco */}
        <div className="space-y-6 px-6 py-7">
          <ProgressSteps status={op.status} />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#8A8FA0]">
                Monto
              </dt>
              <dd className="mt-0.5 font-display text-lg font-semibold">
                {formatARS(op.monto)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#8A8FA0]">
                Comisión
              </dt>
              <dd className="mt-0.5 font-display text-lg font-semibold">
                {formatARS(op.fee)}
              </dd>
            </div>
            {op.comprador_alias && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#8A8FA0]">
                  Comprador
                </dt>
                <dd className="mt-0.5 font-medium">{op.comprador_alias}</dd>
              </div>
            )}
            {op.vendedor_alias && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#8A8FA0]">
                  Vendedor
                </dt>
                <dd className="mt-0.5 font-medium">{op.vendedor_alias}</dd>
              </div>
            )}
          </dl>

          <div className="rounded-xl bg-canvas px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-[#4A4E5E]">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Esta página se actualiza sola. No hace falta que preguntes.
            </p>
          </div>

          <p className="text-center text-xs text-[#8A8FA0]">
            Última actualización: {actualizado}
          </p>
        </div>
      </div>
    </div>
  );
}
