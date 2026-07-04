"use client";

import { useCallback, useState } from "react";

export type ToastKind = "success" | "error";
export type ToastMsg = { id: number; kind: ToastKind; text: string };

// Hook simple de toasts (sin dependencias externas).
export function useToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const push = useCallback((kind: ToastKind, text: string) => {
    // id determinístico basado en un contador incremental via functional update.
    setToasts((prev) => {
      const id = (prev[prev.length - 1]?.id ?? 0) + 1;
      // Auto-dismiss.
      setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.id !== id));
      }, 3500);
      return [...prev, { id, kind, text }];
    });
  }, []);

  return { toasts, push };
}

export function ToastViewport({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-card"
          style={{
            backgroundColor: t.kind === "success" ? "#0E9B82" : "#C0566E",
          }}
        >
          <span aria-hidden>{t.kind === "success" ? "✓" : "✕"}</span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
