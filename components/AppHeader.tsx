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
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold"
            aria-hidden
          >
            A
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            AdminTickets
          </span>
          <span className="hidden text-sm text-white/50 sm:inline">
            · {subtitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {action && (
            <Link
              href={action.href}
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-deep"
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
