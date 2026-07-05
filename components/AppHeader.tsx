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
    <header
      className="border-b-2 border-dashed border-white/10 text-white"
      style={{
        background:
          "linear-gradient(150deg, #262a45 0%, #1B1D29 60%, #16171e 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-brand" />
          <span className="font-display text-lg font-bold">AdminTickets</span>
          <span className="hidden text-sm text-white/50 sm:inline">
            · {subtitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {action && (
            <Link
              href={action.href}
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
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
    </header>
  );
}
