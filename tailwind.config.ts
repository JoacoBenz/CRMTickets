import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#5B4BE0",
        canvas: "#EAEBF0",
        // Colores por estado de la operación
        estado: {
          esperando: "#5B6072", // pizarra
          recibida: "#C7891A", // ámbar
          confirmada: "#0E9B82", // verde-teal
          cancelada: "#C0566E", // rosa
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
