/**
 * A named theme preset: a base mode with CSS variable overrides.
 */
export interface ThemePreset {
  /** Base mode — determines which defaults to start from */
  base: "light" | "dark";
  /** CSS variable overrides — partial, only specify what differs from the base */
  overrides: Partial<Record<string, string>>;
}

// CSS variable names inlined to avoid circular dependency with theme.ts
const P = "--chuk-color-primary";
const BG = "--chuk-color-background";
const SF = "--chuk-color-surface";
const TX = "--chuk-color-text";
const TX2 = "--chuk-color-text-secondary";
const BD = "--chuk-color-border";
const FF = "--chuk-font-family";

/**
 * Built-in theme presets shipped with chuk-mcp-ui.
 */
export const BUILT_IN_PRESETS: Record<string, ThemePreset> = {
  default: {
    base: "light",
    overrides: {},
  },
  dark: {
    base: "dark",
    overrides: {},
  },
  ocean: {
    base: "dark",
    overrides: {
      [P]: "#00bcd4",
      [BG]: "#0d1b2a",
      [SF]: "#1b2838",
      [TX]: "#e0f7fa",
      [TX2]: "#80cbc4",
      [BD]: "#1e3a5f",
    },
  },
  forest: {
    base: "dark",
    overrides: {
      [P]: "#66bb6a",
      [BG]: "#1b2416",
      [SF]: "#2e3b28",
      [TX]: "#e8f5e9",
      [TX2]: "#a5d6a7",
      [BD]: "#33472b",
    },
  },
  terminal: {
    base: "dark",
    overrides: {
      [P]: "#00ff41",
      [BG]: "#0a0a0a",
      [SF]: "#1a1a1a",
      [TX]: "#00ff41",
      [TX2]: "#00cc33",
      [BD]: "#003300",
      [FF]: "'Courier New', Courier, monospace",
    },
  },
  academic: {
    base: "light",
    overrides: {
      [P]: "#1a237e",
      [BG]: "#fafaf5",
      [SF]: "#f0efe8",
      [TX]: "#2c2c2c",
      [TX2]: "#5c5c5c",
      [BD]: "#d4d0c8",
      [FF]: "Georgia, 'Times New Roman', serif",
    },
  },
};
