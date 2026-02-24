# Component Spec: @chuk/view-spectrogram

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-spectrogram`                                              |
| Type        | `spectrogram`                                                         |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Spectrogram View that renders audio frequency visualization using Canvas with configurable colormaps, frequency/time axes, and DPR-aware rendering. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | framer-motion                           | `^11.0.0`     |
| Runtime  | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |
| Build    | vite                                    | `^6.0.0`      |
| Build    | vite-plugin-singlefile                  | `^2.0.0`      |
| Build    | typescript                              | `^5.7.0`      |
| Build    | `@vitejs/plugin-react`                  | `^4.3.0`      |
| Protocol | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |

---

## 2b. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

---

## 3. Schema

### 3.1 Root -- `SpectrogramContent`

```typescript
interface SpectrogramContent {
  type: "spectrogram";
  version: "1.0";
  title?: string;
  data: SpectrogramData;
  frequencyRange?: { min: number; max: number };
  timeRange?: { start: number; end: number };
  colorMap?: "viridis" | "magma" | "inferno" | "grayscale";
  showFrequencyAxis?: boolean;
  showTimeAxis?: boolean;
}

interface SpectrogramData {
  sampleRate: number;
  fftSize: number;
  hopSize: number;
  magnitudes: number[][];
}
```

### 3.2 Defaults

| Field               | Default                                          |
|---------------------|--------------------------------------------------|
| `title`             | `undefined` (not rendered)                       |
| `frequencyRange`    | `{ min: 0, max: sampleRate / 2 }`               |
| `timeRange`         | `{ start: 0, end: (frames * hopSize) / sampleRate }` |
| `colorMap`          | `"viridis"`                                      |
| `showFrequencyAxis` | `true`                                           |
| `showTimeAxis`      | `true`                                           |

---

## 4. Rendering

### 4.1 Layout

Canvas element inside a Card wrapper with max-width 900px. The canvas fills its container with a 2:1 aspect ratio (minimum height 200px). Margins are reserved for axis labels when enabled. A colormap legend bar renders below the canvas showing the gradient from low to high magnitude. Metadata (sample rate, FFT size, hop size, colormap name) is displayed below the legend.

### 4.2 Canvas Rendering

- Pre-computed data renders statically from the `magnitudes` 2D array.
- Each row of magnitudes is one time frame, each column is a frequency bin.
- Rendering uses Canvas 2D `ImageData` for pixel-level control.
- Bilinear interpolation maps canvas pixels to magnitude values when the canvas resolution differs from the data dimensions.
- Magnitude values are normalised to 0-1 range across the entire dataset, then mapped to a 256-entry colormap lookup table (LUT).

### 4.3 Colormap Lookup Tables

Each colormap is a 256-entry RGB lookup table built from piecewise-linear interpolation of key color stops:

- **viridis**: purple (68,1,84) -> blue (59,82,139) -> teal (33,145,140) -> green (94,201,98) -> yellow (253,231,37)
- **magma**: black (0,0,4) -> purple (81,18,124) -> pink (183,55,121) -> orange (254,159,109) -> cream (252,253,191)
- **inferno**: black (0,0,4) -> purple (87,16,110) -> red (188,55,84) -> orange (249,142,9) -> yellow (252,255,164)
- **grayscale**: black (0,0,0) -> white (255,255,255)

### 4.4 Axes

- **Frequency axis** (left): 6 tick marks linearly spaced from `frequencyRange.min` to `frequencyRange.max`, formatted as Hz or kHz.
- **Time axis** (bottom): 6 tick marks linearly spaced from `timeRange.start` to `timeRange.end`, formatted as ms or seconds.

### 4.5 DPR-Aware Rendering

Canvas dimensions are multiplied by `window.devicePixelRatio` for crisp rendering on Retina/HiDPI displays. CSS dimensions remain at logical pixel sizes.

### 4.6 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full spectrogram canvas with axes, legend, and metadata.                |

### 4.7 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Default text colour.                             |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Axis labels, legend text, metadata text.         |

---

## 5. Interactions

### 5.1 User Actions

| Action       | Behaviour                                                              |
|--------------|------------------------------------------------------------------------|
| Resize       | ResizeObserver triggers canvas redraw at new dimensions.               |
| (display)    | Static rendering from pre-computed magnitude data.                     |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 5b. Model Context Updates

None.

---

## 5c. Display Mode

Not applicable. The view stays inline-only.

---

## 5d. Cancellation

Default. No special handling beyond shared Fallback behaviour.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Suited for audio analysis dashboards, speech processing tools, or music visualization panels.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- Canvas element uses `role="img"` with an `aria-label` describing the spectrogram content.
- Metadata text provides textual description of audio parameters.
- Colormap legend provides visual reference for magnitude mapping.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/spectrogram/src/ssr-entry.tsx`
- **Renders:** `SpectrogramRenderer` via `renderToString`
- **Config:** `apps/spectrogram/vite.config.ssr.ts`
- **Output:** `apps/spectrogram/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid SpectrogramContent with data object.
- Accepts spectrogram with all options.
- Accepts viridis colorMap.
- Accepts magma colorMap.
- Accepts inferno colorMap.
- Accepts grayscale colorMap.
- Rejects missing data.
- Rejects missing type.
- Rejects wrong type.
- Rejects missing version.
- Rejects invalid colorMap value.
- Rejects non-number magnitudes.
- Accepts unknown additional fields.
- Accepts multi-frame multi-bin spectrogram.
- Rejects data missing sampleRate.
- Rejects data missing magnitudes.
- Accepts showFrequencyAxis as false.
- Accepts showTimeAxis as false.
- Accepts frequencyRange with min and max.
- Accepts timeRange with start and end.

### Rendering

- Canvas renders with correct colormap pixel colours.
- Bilinear interpolation produces smooth visualisation at any canvas size.
- Frequency axis labels show correct Hz/kHz formatting.
- Time axis labels show correct ms/s formatting.
- DPR scaling produces crisp rendering on Retina displays.
- ResizeObserver redraws on container resize.
- Colormap legend bar shows correct gradient.

### Theme

- Uses theme tokens for all non-data colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/spectrogram/src/Spectrogram.stories.tsx`

| Story              | Description                                                            |
|--------------------|------------------------------------------------------------------------|
| SpeechSpectrogram  | Simulated speech signal with vowel formant patterns (viridis)          |
| MusicSpectrogram   | Simulated music with chord progression and harmonic overtones (inferno)|
| GrayscaleTheme     | Same speech data rendered with grayscale colormap                      |
| MagmaTheme         | Same music data rendered with magma colormap                           |
