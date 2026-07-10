"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// variant "dark": para headers oscuros; "light": para cards blancas.
export default function LogoutButton({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const cls =
    variant === "dark"
      ? "rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/10"
      : "rounded-lg border border-[#D7DAE4] px-3 py-1.5 text-xs font-medium text-[#4A4E5E] transition-colors hover:bg-canvas";

  return (
    <button onClick={logout} className={cls}>
      Salir
    </button>
  );
}
