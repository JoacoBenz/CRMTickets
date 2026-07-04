import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-center">
      <div className="max-w-md">
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-brand" />
          <span className="font-display text-2xl font-bold">Resguardo</span>
        </div>
        <p className="text-[#4A4E5E]">
          Custodia de operaciones de compra-venta de entradas. El estado de cada
          operación se sigue por su link público, que se actualiza solo.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ir al panel
        </Link>
      </div>
    </main>
  );
}
