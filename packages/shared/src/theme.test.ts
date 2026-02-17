import { describe, it, expect, beforeEach } from "vitest";
import { CSS_VARS, applyTheme } from "./theme";

describe("CSS_VARS", () => {
  it("defines all required custom property names", () => {
    expect(CSS_VARS.colorPrimary).toBe("--chuk-color-primary");
    expect(CSS_VARS.colorBackground).toBe("--chuk-color-background");
    expect(CSS_VARS.colorSurface).toBe("--chuk-color-surface");
    expect(CSS_VARS.colorText).toBe("--chuk-color-text");
    expect(CSS_VARS.colorTextSecondary).toBe("--chuk-color-text-secondary");
    expect(CSS_VARS.colorBorder).toBe("--chuk-color-border");
    expect(CSS_VARS.fontFamily).toBe("--chuk-font-family");
    expect(CSS_VARS.borderRadius).toBe("--chuk-border-radius");
  });

  it("has 8 entries", () => {
    expect(Object.keys(CSS_VARS)).toHaveLength(8);
  });
});

describe("applyTheme", () => {
  beforeEach(() => {
    // Clear any previously set styles
    const root = document.documentElement;
    for (const prop of Object.values(CSS_VARS)) {
      root.style.removeProperty(prop);
    }
    root.classList.remove("dark");
  });

  it("applies light theme by default", () => {
    applyTheme();
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--chuk-color-primary")).toBe("#3388ff");
    expect(root.style.getPropertyValue("--chuk-color-background")).toBe("#ffffff");
    expect(root.style.getPropertyValue("--chuk-color-text")).toBe("#1a1a1a");
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("applies light theme explicitly", () => {
    applyTheme("light");
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--chuk-color-primary")).toBe("#3388ff");
    expect(root.style.getPropertyValue("--chuk-color-surface")).toBe("#f5f5f5");
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("applies dark theme", () => {
    applyTheme("dark");
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--chuk-color-primary")).toBe("#5ba3ff");
    expect(root.style.getPropertyValue("--chuk-color-background")).toBe("#1a1a2e");
    expect(root.style.getPropertyValue("--chuk-color-surface")).toBe("#16213e");
    expect(root.style.getPropertyValue("--chuk-color-text")).toBe("#e0e0e0");
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("switches from dark to light", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(
      document.documentElement.style.getPropertyValue("--chuk-color-background")
    ).toBe("#ffffff");
  });

  it("sets all 8 CSS properties", () => {
    applyTheme("light");
    const root = document.documentElement;
    for (const prop of Object.values(CSS_VARS)) {
      expect(root.style.getPropertyValue(prop)).not.toBe("");
    }
  });
});
