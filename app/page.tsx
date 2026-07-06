import Link from "next/link";

// Landing mínima: un talón de entrada como presentación de la marca.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="ticket-shadow w-full max-w-sm overflow-hidden rounded-3xl text-center">
        <div className="holo-strip" aria-hidden />
        <div className="surface-ink punch-b px-6 pb-8 pt-8 text-white">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            Custodia de operaciones
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            AdminTickets
          </h1>
          <p
            className="microtext mt-5 text-white/25"
            aria-hidden
          >
            {"ADMINTICKETS·CUSTODIA·VERIFICADO·".repeat(4)}
          </p>
        </div>

        <div className="punch-t bg-white">
          <div className="perf-line-light mx-6" />
          <div className="px-6 pb-8 pt-6">
            <p className="text-sm leading-relaxed text-[#4A4E5E]">
              Compra-venta de entradas con un intermediario de confianza. El
              estado de cada operación se sigue por su link público, que se
              actualiza solo.
            </p>
            <Link
              href="/admin"
              className="mt-5 inline-block w-full rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              Ir al panel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
