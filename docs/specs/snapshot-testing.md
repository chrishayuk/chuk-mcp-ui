# Snapshot Testing CLI Spec (Phase 5.8)

## Overview

A CLI tool that renders views in headless Chromium via Playwright, captures screenshots, and compares against baselines for visual regression testing. Enables MCP server developers to verify their `structuredContent` renders correctly without running a full host.

---

## CLI Interface

### Capture all views

```bash
pnpm snapshot
```

### Capture a specific view

```bash
pnpm snapshot --filter chart
```

### Update baselines

```bash
pnpm snapshot --update
```

### Compare without updating

```bash
pnpm snapshot --check
```

This is the default mode and the one CI runs. Exits with code 1 if any diffs exceed the threshold.

### Custom data

```bash
pnpm snapshot --filter map --data path/to/custom.json
```

---

## How It Works

1. **Storybook build** — builds the static Storybook if not already built
2. **Playwright launch** — starts headless Chromium
3. **Story enumeration** — reads Storybook's `stories.json` index to find all story IDs
4. **Render** — navigates to each story's iframe URL, waits for render completion
5. **Capture** — takes a viewport screenshot (1280x720 default)
6. **Compare** — pixel-level diff against baseline using `pixelmatch`
7. **Report** — outputs pass/fail per story, overall summary, and diff images for failures

---

## File Structure

```
apps/
  chart/
    __snapshots__/
      Default.png              # baseline
      BarChart.png
      PieChart.png
    src/
      App.stories.tsx          # source stories
  map/
    __snapshots__/
      Default.png
      MultiLayer.png
    src/
      App.stories.tsx
```

Baselines live in `__snapshots__/` alongside each app's source, named after the story export name.

---

## Configuration

### `snapshot.config.ts` (root)

```typescript
export default {
  /** Pixel diff threshold (0-1). Default: 0.001 (0.1%) */
  threshold: 0.001,

  /** Viewport dimensions */
  viewport: { width: 1280, height: 720 },

  /** Wait for this selector before capturing */
  waitForSelector: "[data-testid='view-ready']",

  /** Maximum wait time per story (ms) */
  timeout: 10_000,

  /** Stories to skip (glob patterns on story ID) */
  skip: ["**/playground/**"],

  /** Themes to capture per story */
  themes: ["light", "dark"],
};
```

### Per-story overrides

Stories can set snapshot-specific parameters:

```tsx
export const MapWithLayers: Story = {
  parameters: {
    snapshot: {
      viewport: { width: 1600, height: 900 },
      waitForSelector: ".leaflet-tile-loaded",
      threshold: 0.005,  // maps have tile rendering variance
    },
  },
};
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@playwright/test` | `^1.40` | Browser automation |
| `pixelmatch` | `^6.0` | Pixel-level image comparison |
| `pngjs` | `^7.0` | PNG encoding/decoding |

All added as root `devDependencies`.

---

## CI Integration

### GitHub Actions

```yaml
- name: Visual regression
  run: |
    pnpm build-storybook
    pnpm snapshot --check
  env:
    CI: true
```

On failure, the workflow uploads diff images as artifacts for review.

### Updating baselines in CI

PRs that intentionally change visuals include updated `__snapshots__/*.png` files in the commit. The CI check validates that the committed baselines match what Playwright captures.

---

## Output

### Console (pass)

```
Snapshot Testing — 52 views, 253 stories

  chart/Default .......................... PASS
  chart/BarChart ......................... PASS
  chart/PieChart ......................... PASS
  map/Default ............................ PASS
  ...

253/253 passed (0 failed, 0 skipped)
```

### Console (failure)

```
  chart/PieChart ......................... FAIL (0.3% diff)
    Diff saved: apps/chart/__snapshots__/PieChart.diff.png

1/253 failed
```

### Diff images

When a story fails, three images are saved:

- `Story.png` — the baseline
- `Story.actual.png` — what was captured
- `Story.diff.png` — pixel diff highlighted in red

---

## Test Cases

| ID | Scenario | Expected |
|----|----------|----------|
| ST-01 | First run, no baselines exist | All stories saved as new baselines, no failures |
| ST-02 | `--check` with matching baselines | All pass, exit 0 |
| ST-03 | `--check` with visual change | Failed stories reported, exit 1 |
| ST-04 | `--update` after visual change | Baselines updated, exit 0 |
| ST-05 | `--filter chart` | Only chart stories captured |
| ST-06 | `--data custom.json` with `--filter map` | Custom data rendered in map view |
| ST-07 | Story with `snapshot.skip: true` parameter | Story skipped in output |
| ST-08 | Theme captures | Each story captured in both light and dark |
| ST-09 | Timeout on slow render | Story reported as error, not failure |
| ST-10 | `waitForSelector` not found | Story reported as error with timeout message |

---

## Relationship to Phase 9

The snapshot CLI powers the Phase 9 View Catalogue's thumbnail generation and visual regression. The same Playwright infrastructure captures preview thumbnails for the catalogue index page.
