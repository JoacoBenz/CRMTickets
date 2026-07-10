import LogoutButton from "@/components/admin/LogoutButton";

// Página para usuarios autenticados sin rol asignado. No requiere rol
// (queda fuera del matcher del middleware) para no generar loops.
export default function SinAccesoPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="ticket-shadow w-full max-w-sm overflow-hidden rounded-3xl text-center">
        <div className="holo-strip" aria-hidden />

        <div className="surface-ink punch-b px-6 pb-7 pt-6 text-white">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            AdminTickets
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
            Sin acceso
          </h1>
        </div>

        <div className="punch-t bg-white">
          <div className="perf-line-light mx-6" />
          <div className="space-y-4 px-6 pb-7 pt-6">
            <p className="text-sm text-[#4A4E5E]">
              Tu usuario todavía no tiene un rol asignado. Pedile al
              administrador que te habilite como moderador o administrador.
            </p>
            <LogoutButton variant="light" />
          </div>
        </div>
      </div>
    </main>
  );
}
