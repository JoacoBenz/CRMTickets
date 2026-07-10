import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

type Props = {
  subtitle: string;
  email?: string | null;
  // Link opcional para saltar al otro módulo (ej: admin -> carga).
  action?: { href: string; label: string };
};

export default function AppHeader({ subtitle, email, action }: Props) {
  return (
    <header className="surface-ink text-white">
      {/* flex-wrap: en pantallas angostas los botones bajan a una segunda
          fila con aire, en vez de apilarse o cortarse en el borde. */}
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2.5 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold"
            aria-hidden
          >
            A
          </span>
          <span className="whitespace-nowrap font-display text-lg font-bold tracking-tight">
            AdminTickets
          </span>
          <span className="hidden truncate text-sm text-white/50 sm:inline">
            · {subtitle}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {action && (
            <Link
              href={action.href}
              className="whitespace-nowrap rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              {action.label}
            </Link>
          )}
          {email && (
            <span className="hidden font-mono text-xs text-white/50 md:inline">
              {email}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
      <div className="holo-strip" aria-hidden />
    </header>
  );
}
