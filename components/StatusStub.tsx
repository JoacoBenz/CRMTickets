import {
  STATUS_COLOR,
  STATUS_LABEL,
  formatARS,
  type OperacionPublica,
} from "@/lib/operaciones";
import ProgressSteps from "./ProgressSteps";

// Código de barras decorativo, derivado determinísticamente del code de la
// operación (cada char define anchos de barra). Refuerza el motivo "entrada".
function Barcode({ code }: { code: string }) {
  const chars = Array.from(code.replace(/-/g, ""));
  return (
    <div className="flex h-9 items-stretch justify-center gap-[3px]" aria-hidden>
      {chars.flatMap((ch, i) => {
        const n = ch.charCodeAt(0);
        const widths = [2, 1 + (n % 3), 2 + ((n >> 1) % 3), 1 + ((n >> 2) % 2)];
        return widths.map((w, j) => (
          <span
            key={`${i}-${j}`}
            className="inline-block rounded-[1px] bg-[#1B1D29]"
            style={{ width: w }}
          />
        ));
      })}
    </div>
  );
}

// Talón / stub de entrada. Encabezado oscuro con evento + code, línea de
// troquelado, "sello" estampado con el estado y barcode al pie.
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
        {/* Mitad oscura del talón */}
        <div
          className="text-white"
          style={{
            background:
              "linear-gradient(150deg, #262a45 0%, #1B1D29 55%, #16171e 100%)",
          }}
        >
          <div className="relative px-6 pb-9 pt-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/60">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-brand"
                  aria-hidden
                />
                Resguardo · Custodia
              </div>
              <span className="whitespace-nowrap rounded-md border border-white/15 px-2 py-0.5 font-mono text-[11px] text-white/70">
                {op.code}
              </span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold leading-tight">
              {op.evento}
            </h1>
          </div>

          {/* Línea de troquelado con muescas en los bordes */}
          <div className="relative">
            <div className="perf-line mx-6" />
            <span className="perf-notch left" aria-hidden />
            <span className="perf-notch right" aria-hidden />
          </div>

          {/* Sello estampado */}
          <div className="flex justify-center px-6 pb-9 pt-9">
            <div
              className="stamp w-full max-w-[330px] px-6 py-3.5 text-center"
              style={{ color }}
            >
              <span className="block text-[10px] font-semibold tracking-[0.3em] opacity-70">
                Estado
              </span>
              <span
                className="mt-0.5 block font-display text-xl font-bold leading-tight tracking-wide sm:text-2xl"
                style={{ textWrap: "balance" }}
              >
                {STATUS_LABEL[op.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo blanco */}
        <div className="space-y-6 px-6 py-7">
          <ProgressSteps status={op.status} />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div className="col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-[#8A8FA0]">
                Monto
              </dt>
              <dd className="mt-0.5 font-display text-2xl font-bold">
                {formatARS(op.monto)}
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

        {/* Pie con troquelado + barcode */}
        <div className="relative">
          <div className="perf-line-light mx-6">
            <span className="perf-notch-light left" aria-hidden />
            <span className="perf-notch-light right" aria-hidden />
          </div>
          <div className="px-6 pb-6 pt-5">
            <Barcode code={op.code} />
            <p className="mt-2 text-center font-mono text-[11px] tracking-[0.35em] text-[#8A8FA0]">
              {op.code}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
