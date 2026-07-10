import { describe, expect, it } from "vitest";
import {
  canTransition,
  generateCode,
  nextStatus,
  nextStatusLabel,
  progressStep,
  whatsappMessage,
  type Status,
} from "./operaciones";

const ALL: Status[] = [
  "esperando_entrada",
  "entrada_recibida",
  "confirmada",
  "cancelada",
];

describe("canTransition (máquina de estados)", () => {
  it("permite el flujo feliz", () => {
    expect(canTransition("esperando_entrada", "entrada_recibida")).toBe(true);
    expect(canTransition("entrada_recibida", "confirmada")).toBe(true);
  });

  it("permite cancelar desde estados no terminales", () => {
    expect(canTransition("esperando_entrada", "cancelada")).toBe(true);
    expect(canTransition("entrada_recibida", "cancelada")).toBe(true);
  });

  it("no permite cancelar una confirmada ni re-cancelar", () => {
    expect(canTransition("confirmada", "cancelada")).toBe(false);
    expect(canTransition("cancelada", "cancelada")).toBe(false);
  });

  it("permite reabrir una cancelada solo hacia esperando_entrada", () => {
    expect(canTransition("cancelada", "esperando_entrada")).toBe(true);
    expect(canTransition("cancelada", "entrada_recibida")).toBe(false);
    expect(canTransition("cancelada", "confirmada")).toBe(false);
  });

  it("confirmada es terminal: no sale a ningún estado", () => {
    for (const to of ALL) {
      expect(canTransition("confirmada", to)).toBe(false);
    }
  });

  it("no permite saltos ni retrocesos en el flujo", () => {
    expect(canTransition("esperando_entrada", "confirmada")).toBe(false);
    expect(canTransition("entrada_recibida", "esperando_entrada")).toBe(false);
    expect(canTransition("confirmada", "entrada_recibida")).toBe(false);
  });

  it("no permite transicionar al mismo estado", () => {
    for (const s of ALL) {
      expect(canTransition(s, s)).toBe(false);
    }
  });
});

describe("nextStatus / nextStatusLabel", () => {
  it("avanza solo desde estados no terminales", () => {
    expect(nextStatus("esperando_entrada")).toBe("entrada_recibida");
    expect(nextStatus("entrada_recibida")).toBe("confirmada");
    expect(nextStatus("confirmada")).toBeNull();
    expect(nextStatus("cancelada")).toBeNull();
  });

  it("toda transición de nextStatus es válida según canTransition", () => {
    for (const s of ALL) {
      const n = nextStatus(s);
      if (n) expect(canTransition(s, n)).toBe(true);
    }
  });

  it("el label del botón existe exactamente cuando hay siguiente estado", () => {
    for (const s of ALL) {
      expect(nextStatusLabel(s) !== null).toBe(nextStatus(s) !== null);
    }
  });
});

describe("progressStep", () => {
  it("mapea estados a pasos de la barra", () => {
    expect(progressStep("esperando_entrada")).toBe(0);
    expect(progressStep("entrada_recibida")).toBe(1);
    expect(progressStep("confirmada")).toBe(3);
    expect(progressStep("cancelada")).toBe(0);
  });
});

describe("generateCode", () => {
  it("genera codes con el formato BX-XXXXXXXX sin caracteres ambiguos", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode();
      expect(code).toMatch(/^BX-[A-HJ-NP-Z2-9]{8}$/);
      expect(code).not.toMatch(/[01IO]/);
    }
  });
});

describe("whatsappMessage", () => {
  it("incluye el evento y el link", () => {
    const msg = whatsappMessage("River vs Boca", "https://x.app/op/abc");
    expect(msg).toContain("River vs Boca");
    expect(msg).toContain("https://x.app/op/abc");
    expect(msg).toContain("AdminTickets");
  });
});
