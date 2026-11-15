import { describe, expect, it } from "vitest";
import {
  applyDys,
  DEFAULT_DYS,
  DYS_PRESET,
  DYS_STORAGE_KEY,
  dysRootStyle,
  isDysActive,
  loadDys,
  sanitizeDys,
  saveDys,
} from "@/lib/dys";

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    data,
  };
};

describe("Mode DYS", () => {
  it("starts with the usual display", () => {
    expect(isDysActive(DEFAULT_DYS)).toBe(false);
    expect(isDysActive(DYS_PRESET)).toBe(true);
  });
  it("rejects unknown or broken values", () => {
    expect(
      sanitizeDys({
        font: "comic",
        background: "pink",
        scale: "big",
        speechRate: 3,
        readingRuler: "yes",
      }),
    ).toEqual(DEFAULT_DYS);
    expect(sanitizeDys({ scale: 900 }).scale).toBe(175);
    expect(sanitizeDys({ scale: 10 }).scale).toBe(100);
    expect(sanitizeDys(null)).toEqual(DEFAULT_DYS);
    expect(sanitizeDys({ scale: 130 }).scale).toBe(125);
  });
  it("keeps valid settings", () => {
    expect(sanitizeDys(DYS_PRESET)).toEqual(DYS_PRESET);
  });
  it("saves and reloads the settings", () => {
    const store = memory();
    saveDys(DYS_PRESET, store);
    expect(JSON.parse(store.data.get(DYS_STORAGE_KEY)!)).toEqual(DYS_PRESET);
    expect(loadDys(store)).toEqual(DYS_PRESET);
  });
  it("survives corrupted or unavailable storage", () => {
    expect(loadDys({ getItem: () => "{oops" })).toEqual(DEFAULT_DYS);
    expect(
      loadDys({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toEqual(DEFAULT_DYS);
    expect(() =>
      saveDys(DYS_PRESET, {
        setItem: () => {
          throw new Error("full");
        },
      }),
    ).not.toThrow();
  });
  it("turns settings into root attributes and CSS variables", () => {
    const { attributes, variables } = dysRootStyle({
      ...DEFAULT_DYS,
      font: "opendyslexic",
      scale: 150,
      lineHeight: "wider",
      letterSpacing: "wide",
      background: "dark",
    });
    expect(attributes).toMatchObject({
      "data-dys-font": "opendyslexic",
      "data-dys-bg": "dark",
      "data-dys-spacing": "wide",
      "data-dys-leading": "wider",
    });
    expect(variables).toMatchObject({
      "--pisan-scale": "1.5",
      "--pisan-line-height": "2.1",
      "--pisan-letter-spacing": "0.06em",
    });
  });
  it("applies to <html> and cleans up when reset", () => {
    const root = document.createElement("html");
    applyDys(DYS_PRESET, root);
    expect(root.getAttribute("data-dys-font")).toBe("lexend");
    expect(root.style.getPropertyValue("--pisan-scale")).toBe("1.25");
    applyDys(DEFAULT_DYS, root);
    expect(root.getAttribute("data-dys-font")).toBe("default");
    expect(root.style.getPropertyValue("--pisan-scale")).toBe("");
    expect(root.style.getPropertyValue("--pisan-letter-spacing")).toBe("");
  });
});
