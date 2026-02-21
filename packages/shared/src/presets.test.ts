import { describe, it, expect, beforeEach } from "vitest";
import {
  applyPreset,
  registerPreset,
  getPresetNames,
  applyTheme,
  CSS_VARS,
  LIGHT_DEFAULTS,
  DARK_DEFAULTS,
} from "./theme";
import { BUILT_IN_PRESETS } from "./presets";

function getCSSVar(name: string): string {
  return document.documentElement.style.getPropertyValue(name);
}

beforeEach(() => {
  // Reset CSS vars before each test
  for (const prop of Object.values(CSS_VARS)) {
    document.documentElement.style.removeProperty(prop);
  }
  document.documentElement.classList.remove("dark");
});

describe("theme presets", () => {
  it("TP-01: applyPreset('ocean') sets ocean colors", () => {
    applyPreset("ocean");
    const ocean = BUILT_IN_PRESETS["ocean"];
    const expected = ocean.overrides[CSS_VARS.colorPrimary]!;
    expect(getCSSVar(CSS_VARS.colorPrimary)).toBe(expected);
  });

  it("TP-02: applyPreset('nonexistent') falls back to default (light)", () => {
    applyPreset("nonexistent");
    expect(getCSSVar(CSS_VARS.colorBackground)).toBe(
      LIGHT_DEFAULTS[CSS_VARS.colorBackground]
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("TP-03: registerPreset + applyPreset applies custom values", () => {
    registerPreset("custom", {
      base: "light",
      overrides: { [CSS_VARS.colorPrimary]: "#ff0000" },
    });
    applyPreset("custom");
    expect(getCSSVar(CSS_VARS.colorPrimary)).toBe("#ff0000");
    // Non-overridden values come from light base
    expect(getCSSVar(CSS_VARS.colorBackground)).toBe(
      LIGHT_DEFAULTS[CSS_VARS.colorBackground]
    );
  });

  it("TP-04: getPresetNames includes built-in and custom presets", () => {
    registerPreset("my-brand", { base: "dark", overrides: {} });
    const names = getPresetNames();
    expect(names).toContain("default");
    expect(names).toContain("dark");
    expect(names).toContain("ocean");
    expect(names).toContain("my-brand");
  });

  it("TP-06: applyTheme('dark') after applyPreset overrides preset", () => {
    applyPreset("ocean");
    applyTheme("dark");
    expect(getCSSVar(CSS_VARS.colorBackground)).toBe(
      DARK_DEFAULTS[CSS_VARS.colorBackground]
    );
  });

  it("TP-07: registerPreset with partial dark overrides merges correctly", () => {
    registerPreset("partial", {
      base: "dark",
      overrides: { [CSS_VARS.colorPrimary]: "#ff0000" },
    });
    applyPreset("partial");
    expect(getCSSVar(CSS_VARS.colorPrimary)).toBe("#ff0000");
    expect(getCSSVar(CSS_VARS.colorBackground)).toBe(
      DARK_DEFAULTS[CSS_VARS.colorBackground]
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("TP-08: applyPreset('dark') is equivalent to applyTheme('dark')", () => {
    applyPreset("dark");
    const presetBg = getCSSVar(CSS_VARS.colorBackground);

    applyTheme("dark");
    const themeBg = getCSSVar(CSS_VARS.colorBackground);

    expect(presetBg).toBe(themeBg);
  });

  it("built-in presets all have valid base modes", () => {
    for (const [name, preset] of Object.entries(BUILT_IN_PRESETS)) {
      expect(["light", "dark"]).toContain(preset.base);
      // Should not throw
      applyPreset(name);
    }
  });
});
