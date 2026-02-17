/**
 * Standard CSS custom property names used by all Views.
 * Host theme context is mapped to these variables.
 */
export const CSS_VARS = {
  colorPrimary: "--chuk-color-primary",
  colorBackground: "--chuk-color-background",
  colorSurface: "--chuk-color-surface",
  colorText: "--chuk-color-text",
  colorTextSecondary: "--chuk-color-text-secondary",
  colorBorder: "--chuk-color-border",
  fontFamily: "--chuk-font-family",
  borderRadius: "--chuk-border-radius",
} as const;

/** Default light theme values */
const LIGHT_DEFAULTS: Record<string, string> = {
  [CSS_VARS.colorPrimary]: "#3388ff",
  [CSS_VARS.colorBackground]: "#ffffff",
  [CSS_VARS.colorSurface]: "#f5f5f5",
  [CSS_VARS.colorText]: "#1a1a1a",
  [CSS_VARS.colorTextSecondary]: "#666666",
  [CSS_VARS.colorBorder]: "#e0e0e0",
  [CSS_VARS.fontFamily]: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  [CSS_VARS.borderRadius]: "6px",
};

/** Default dark theme values */
const DARK_DEFAULTS: Record<string, string> = {
  [CSS_VARS.colorPrimary]: "#5ba3ff",
  [CSS_VARS.colorBackground]: "#1a1a2e",
  [CSS_VARS.colorSurface]: "#16213e",
  [CSS_VARS.colorText]: "#e0e0e0",
  [CSS_VARS.colorTextSecondary]: "#999999",
  [CSS_VARS.colorBorder]: "#333355",
  [CSS_VARS.fontFamily]: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  [CSS_VARS.borderRadius]: "6px",
};

/**
 * Apply theme to the document root as CSS custom properties.
 * Called when host context is received or changes.
 */
export function applyTheme(mode: "light" | "dark" = "light"): void {
  const root = document.documentElement;
  const defaults = mode === "dark" ? DARK_DEFAULTS : LIGHT_DEFAULTS;

  for (const [prop, value] of Object.entries(defaults)) {
    root.style.setProperty(prop, value);
  }

  root.classList.toggle("dark", mode === "dark");
}
