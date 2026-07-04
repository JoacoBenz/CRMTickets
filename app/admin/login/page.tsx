"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Login del admin con Supabase Auth (email/password).
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // El middleware redirige a /admin cuando ya hay sesión.
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-brand" />
            <span className="font-display text-xl font-bold">Resguardo</span>
          </div>
          <p className="text-sm text-[#6A6E7E]">Panel de administración</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-card"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[#4A4E5E]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#D7DAE4] bg-white px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[#4A4E5E]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#D7DAE4] bg-white px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-estado-cancelada/10 px-3 py-2 text-sm text-estado-cancelada">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
