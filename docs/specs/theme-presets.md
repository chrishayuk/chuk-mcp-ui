# Theme Presets Spec (Phase 5.5)

## Overview

Extend the existing `applyTheme("light" | "dark")` system with named presets that override CSS custom properties. Enables visual customization without code changes.

---

## Current State

**File:** `packages/shared/src/theme.ts`

The theme system defines 8 CSS custom properties (`--chuk-*`) with `LIGHT_DEFAULTS` and `DARK_DEFAULTS` records. `applyTheme(mode)` sets these on `document.documentElement`.

All 66 views consume these variables via the Tailwind theme bridge in `packages/ui/src/styles/theme.css`.

---

## API

### `applyPreset(name: string): void`

Applies a named preset. Falls back to `"default"` (light) if the name is not found.

```typescript
import { applyPreset } from "@chuk/view-shared";

applyPreset("ocean");
```

### `registerPreset(name: string, overrides: Partial<ThemeTokens>): void`

Registers a custom preset at runtime. Overrides are merged on top of the base light or dark tokens (determined by the preset's `base` field).

```typescript
import { registerPreset } from "@chuk/view-shared";

registerPreset("corporate", {
  base: "light",
  colorPrimary: "#0052CC",
  colorBackground: "#FAFBFC",
  colorSurface: "#F1F3F5",
});
```

### `getPresetNames(): string[]`

Returns all registered preset names (built-in + custom).

### URL Query Param

Views check `?theme=<name>` on load:

```
https://mcp-views.chukai.io/chart/v1?theme=ocean
```

This is read once at initialization and passed to `applyPreset()`. The host's `onhostcontextchanged` callback takes precedence if it fires after load.

---

## Data Model

```typescript
interface ThemePreset {
  /** Base mode — determines which defaults to start from */
  base: "light" | "dark";
  /** CSS variable overrides — partial, only specify what differs */
  overrides: Partial<Record<keyof typeof CSS_VARS, string>>;
}

type ThemeTokens = {
  base: "light" | "dark";
  colorPrimary: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextSecondary: string;
  colorBorder: string;
  fontFamily: string;
  borderRadius: string;
};
```

---

## Built-in Presets

| Name | Base | Description |
|------|------|-------------|
| `default` | light | Current `LIGHT_DEFAULTS` — no change |
| `dark` | dark | Current `DARK_DEFAULTS` — no change |
| `ocean` | dark | Deep blue tones, teal accents |
| `forest` | dark | Dark green, warm amber accents |
| `terminal` | dark | Green-on-black terminal aesthetic |
| `academic` | light | Clean serif fonts, muted palette |

---

## Implementation

**Files to modify:**
- `packages/shared/src/theme.ts` — add preset registry, `applyPreset`, `registerPreset`, `getPresetNames`
- `packages/shared/src/use-view.ts` — read `?theme=` query param on mount
- `packages/shared/src/index.ts` — export new functions

**Files to create:**
- `packages/shared/src/presets.ts` — built-in preset definitions

### Backward Compatibility

- `applyTheme("light")` and `applyTheme("dark")` continue to work unchanged
- `applyPreset("default")` is equivalent to `applyTheme("light")`
- `applyPreset("dark")` is equivalent to `applyTheme("dark")`
- No changes to `@chuk/view-ui` — it reads the same CSS variables

### Resolution Order

1. Host `onhostcontextchanged` fires → `applyTheme(mode)` (always wins)
2. URL `?theme=<name>` → `applyPreset(name)` (on initial load only)
3. Default → `applyTheme("light")`

---

## Test Cases

| ID | Input | Expected |
|----|-------|----------|
| TP-01 | `applyPreset("ocean")` | `--chuk-color-primary` set to ocean's value |
| TP-02 | `applyPreset("nonexistent")` | Falls back to `default` (light) |
| TP-03 | `registerPreset("custom", {...})` then `applyPreset("custom")` | Custom values applied |
| TP-04 | `getPresetNames()` after registering custom | Returns built-in + custom names |
| TP-05 | URL `?theme=terminal` on view load | Terminal preset applied |
| TP-06 | `applyTheme("dark")` after `applyPreset("ocean")` | Dark defaults override ocean |
| TP-07 | `registerPreset("x", { base: "dark", colorPrimary: "#f00" })` | Only primary overridden, rest from dark defaults |
| TP-08 | `applyPreset("dark")` | Equivalent to `applyTheme("dark")` |
