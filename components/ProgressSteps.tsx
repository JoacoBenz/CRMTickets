import {
  PROGRESS_LABELS,
  STATUS_COLOR,
  progressStep,
  type Status,
} from "@/lib/operaciones";

// Barra de progreso de 3 pasos: Entrada -> Pago -> Listo.
// El "llenado" y el color dependen del estado. En cancelada queda apagada.
export default function ProgressSteps({ status }: { status: Status }) {
  const step = progressStep(status);
  const color =
    status === "cancelada" ? STATUS_COLOR.cancelada : STATUS_COLOR[status];
  const isCancelled = status === "cancelada";

  return (
    <div className="w-full">
      <div className="flex items-center">
        {PROGRESS_LABELS.map((label, i) => {
          // Cada paso ocupa un "punto"; entre puntos hay una línea.
          const dotFilled = !isCancelled && step > i;
          const dotCurrent = !isCancelled && step === i + 1 && step < 3;
          const active = dotFilled || dotCurrent;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors"
                  style={{
                    borderColor: active ? color : "#C7CAD6",
                    backgroundColor: active ? color : "transparent",
                    color: active ? "#fff" : "#8A8FA0",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: active ? color : "#8A8FA0" }}
                >
                  {label}
                </span>
              </div>
              {i < PROGRESS_LABELS.length - 1 && (
                <div className="mx-1.5 h-0.5 flex-1 rounded-full bg-[#D7DAE4]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: !isCancelled && step > i + 1 ? "100%" : "0%",
                      backgroundColor: color,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
