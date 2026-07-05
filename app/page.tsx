import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-card">
        <div
          className="px-6 pb-8 pt-8 text-white"
          style={{
            background:
              "linear-gradient(150deg, #262a45 0%, #1B1D29 60%, #16171e 100%)",
          }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/60">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            Custodia de operaciones
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">AdminTickets</h1>
        </div>

        <div className="relative">
          <div className="perf-line-light mx-6" />
          <span className="perf-notch-light left" aria-hidden />
          <span className="perf-notch-light right" aria-hidden />
        </div>

        <div className="px-6 pb-8 pt-6">
          <p className="text-sm text-[#4A4E5E]">
            Compra-venta de entradas con un intermediario de confianza. El estado
            de cada operación se sigue por su link público, que se actualiza
            solo.
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-block w-full rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ir al panel
          </Link>
        </div>
      </div>
    </main>
  );
}
