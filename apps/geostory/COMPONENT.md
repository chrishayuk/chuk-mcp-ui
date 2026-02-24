# @chuk/view-geostory

## Identity

- **Name:** @chuk/view-geostory
- **Type:** geostory
- **Version:** 1.0
- **Category:** Tier 3 — Compound
- **Description:** Scrollytelling map narrative that pairs a scrolling text panel with an animated location card, advancing through geographic steps via IntersectionObserver.

## Dependencies

- **Runtime:** React 18, framer-motion, @chuk/view-shared, @chuk/view-ui
- **Build:** vite, vite-plugin-singlefile, typescript, @tailwindcss/vite
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, requestDisplayMode, displayMode |

## Schema

### Input (structuredContent)

```typescript
interface GeostoryContent {
  type: "geostory";
  version: "1.0";
  title?: string;
  steps: GeostoryStep[];
  basemap?: "terrain" | "satellite" | "simple";
}

interface GeostoryStep {
  id: string;
  title: string;
  text: string;
  location: {
    lat: number;
    lon: number;
  };
  zoom?: number;
  image?: string;
  marker?: string;
}
```

### Defaults

| Field | Default |
|-------|---------|
| title | `undefined` (header hidden) |
| basemap | `"simple"` |
| step.zoom | `undefined` (shown only when present) |
| step.image | `undefined` (image section hidden) |
| step.marker | `undefined` (marker badge hidden) |

## Rendering

### Layout

Split layout filling the full iframe viewport height:

- **Left panel (50%):** Scrollable narrative with step cards. Vertical spacers (30vh) at top and bottom allow the first and last steps to reach the IntersectionObserver observation zone. Each step is rendered as a `Card` with a numbered badge, title, body text, optional image, and coordinate display.
- **Right panel (50%):** Centered location card with `AnimatePresence` crossfade animation. Displays a gradient header area simulating a basemap, a pulsing red location dot, coordinate overlay, optional marker badge, title, text, optional image, and optional zoom level.
- **Header:** Optional title rendered above the split layout when `title` is provided.
- **Fullscreen button:** Absolute positioned top-right corner (`z-[1000]`).

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | Returns `null` (no fallback rendered by View wrapper) until `data` is available. |
| **Empty** | Not applicable -- `steps` array is required. |
| **Populated** | Steps rendered in left panel; active step's location card shown in right panel. |
| **Error** | Falls through to `null` render when data is absent. |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text via `font-sans` |
| `--chuk-color-text` | Step card text, location card text (`text-foreground`) |
| `--chuk-color-text-secondary` | Body text, coordinates (`text-muted-foreground`) |
| `--chuk-color-background` | Root container, fullscreen button bg |
| `--chuk-color-surface` | Card backgrounds |
| `--chuk-color-border` | Left/right panel divider, card borders, fullscreen button border |
| `--chuk-color-primary` | Active step card ring, numbered badge bg, location pin icon |
| `--chuk-border-radius` | Card corners, image corners |

Basemap background varies by setting: `terrain` uses emerald tones, `satellite` uses slate-dark tones, `simple` uses light/dark adaptive slate tones.

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Scroll narrative | Scroll left panel | IntersectionObserver detects active step, updates right-panel location card with crossfade animation |
| Toggle fullscreen | Click fullscreen button (top-right) | Switches between `"inline"` and `"fullscreen"` via `requestDisplayMode()` |

### Outbound Events (sendMessage)

None.

### Server Calls (callServerTool)

None.

### Action Templates

None.

## Model Context Updates

None.

## Display Mode

Fullscreen toggle button in top-right corner (`absolute top-2 right-2 z-[1000]`). Uses semi-transparent background (`bg-background/80 backdrop-blur-sm`). Toggles between `"inline"` and `"fullscreen"` via `requestDisplayMode()`. Button label shows current state: "Fullscreen" or "Exit Fullscreen". Only rendered when `onRequestDisplayMode` is available (host supports it).

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

## Streaming

Not implemented. The View only renders on full `ontoolresult`.

## Composition

### As Child

When embedded in a composition container (dashboard, split, tabs), the geostory occupies its allocated panel. The split layout adapts to the available height. No inbound event handling is implemented.

### As Parent

Not applicable. `view-geostory` does not embed other Views.

### Cross-View Events

None.

## CSP Requirements

```json
{
  "img-src": [
    "https://*.tile.openstreetmap.org",
    "https://server.arcgisonline.com",
    "https://*.tile.opentopomap.org",
    "https://*.basemaps.cartocdn.com"
  ]
}
```

Note: The current implementation does not render actual map tiles (it uses gradient placeholders for the location card), but step `image` fields may reference external image URLs. If tile integration is added, the above CSP domains would be required.

## Accessibility

- Step cards use semantic heading elements (`<h3>`) for titles.
- Numbered badges provide visual and textual step ordering.
- Fullscreen button has descriptive text label ("Fullscreen" / "Exit Fullscreen").
- Images include `alt` text derived from step titles.
- Coordinate text uses monospace font for readability.
- Active step is visually distinguished with ring and opacity (not colour alone).

## Size Budget

**Target:** < 150KB gzip (React + framer-motion + app code)

## SSR Entry

- **File:** `apps/geostory/src/ssr-entry.tsx`
- **Renders:** `GeostoryRenderer` via `renderToString`
- **Config:** `apps/geostory/vite.config.ssr.ts`
- **Output:** `apps/geostory/dist-ssr/ssr-entry.js`

## Test Cases

- **Schema Validation:** Accepts valid `GeostoryContent` with multiple steps.
- **Schema Validation:** Rejects missing `type` or `steps` field.
- **Schema Validation:** Accepts unknown additional fields (forward compatibility).
- **Rendering:** Steps render as cards in the left panel with numbered badges.
- **Rendering:** Active step location card displays in the right panel with correct title and coordinates.
- **Rendering:** Optional title header is hidden when `title` is undefined.
- **Rendering:** Step images render when `image` field is present.
- **Rendering:** Basemap background changes based on `basemap` value (terrain/satellite/simple).
- **Fullback:** Returns `null` when `data` is absent.
- **Display Mode:** Fullscreen button visible when `onRequestDisplayMode` is provided; hidden otherwise.

## Storybook Stories

Story file: `apps/geostory/src/Geostory.stories.tsx`

| Story | Description |
|-------|-------------|
| HistoricalJourney | Silk Road route with 5 steps across Eurasia, terrain basemap, marker labels |
| NatureTrail | Yellowstone Discovery Trail with 4 steps, satellite basemap, step images |
| UrbanExploration | Tokyo walking tour with 4 steps, simple basemap, no images |
