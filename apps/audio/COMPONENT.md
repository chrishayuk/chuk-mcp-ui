# Component Spec: @chuk/view-audio

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-audio`                                                    |
| Type        | `audio`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Audio player View with canvas waveform visualization, region overlays, and playback controls. Renders an `HTMLAudioElement` with a custom waveform display, play/pause button, time display, and volume slider. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | `framer-motion`                         | `^11.0.0`     |
| Runtime  | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |
| Runtime  | `zod`                                   | `^4.0.0`      |
| Build    | vite                                    | `^6.0.0`      |
| Build    | vite-plugin-singlefile                  | `^2.0.0`      |
| Build    | typescript                              | `^5.7.0`      |
| Build    | `@vitejs/plugin-react`                  | `^4.3.0`      |
| Build    | `@tailwindcss/vite`                     | `^4.0.0`      |

---

## 3. Schema

### 3.1 Root -- `AudioContent`

```typescript
interface AudioContent {
  type: "audio";
  version: "1.0";
  title?: string;
  url: string;
  waveform?: number[];
  duration?: number;
  regions?: AudioRegion[];
  autoplay?: boolean;
  loop?: boolean;
}
```

### 3.2 AudioRegion

```typescript
interface AudioRegion {
  id: string;
  start: number;
  end: number;
  label?: string;
  color?: string;
}
```

### 3.3 Defaults

| Field       | Default     |
|-------------|-------------|
| `title`     | `undefined` (title is not rendered) |
| `waveform`  | `undefined` (placeholder random waveform generated) |
| `duration`  | `undefined` (read from audio metadata on load) |
| `regions`   | `undefined` (no region overlays) |
| `autoplay`  | `false`     |
| `loop`      | `false`     |

---

## 4. Rendering

### 4.1 Layout

The component is wrapped in a `Card` inside a `motion.div` with `fadeIn` animation. Maximum width is 700px, centred horizontally with padding.

Inside the card:
1. **Title** (optional): `text-lg font-semibold` heading.
2. **Waveform canvas**: Full-width, 96px tall (`h-24`). Rounded corners with muted background. Clickable for seeking.
3. **Controls row**: Play/pause `Button`, time display, spacer, volume `Slider`.
4. **Region legend** (optional): Flex-wrapped row of region labels with colour chips and time ranges. Separated by a top border.

### 4.2 Waveform Canvas

- Vertical bars drawn from the `waveform` amplitude array (values 0--1).
- Played portion coloured with the CSS `--color-primary` variable.
- Unplayed portion coloured with the CSS `--color-muted` variable.
- A vertical playhead line drawn at the current playback position using `--color-foreground`.
- Region overlays drawn as semi-transparent coloured rectangles with optional labels.
- Canvas is DPR-aware for sharp rendering on high-resolution displays.
- `ResizeObserver` ensures the canvas redraws on container resize.

### 4.3 Playback

- Native `HTMLAudioElement` handles actual audio playback via `useRef`.
- Progress is tracked via `requestAnimationFrame` for smooth playhead movement.
- `timeupdate` event provides a fallback for time tracking.
- `loadedmetadata` event reads the actual duration from the audio element.

### 4.4 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full audio player with waveform, controls, and optional regions.        |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.5 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-primary`            | Played waveform bars.                            |
| `--color-muted`              | Unplayed waveform bars, canvas background.       |
| `--color-foreground`         | Playhead line, body text.                        |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Time display, volume icon, region labels.        |

---

## 5. Interactions

### 5.1 User Actions

| Action         | Trigger                        | Result                                               |
|----------------|--------------------------------|------------------------------------------------------|
| Play/Pause     | Click play/pause button        | Toggles audio playback via `HTMLAudioElement`.        |
| Seek           | Click on waveform canvas       | Seeks to position based on click x-coordinate ratio. |
| Volume         | Drag volume slider             | Adjusts `HTMLAudioElement.volume` (0--1).            |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`. No progressive
rendering via `ontoolinputpartial`. The audio source URL is set once and
playback is handled by the native `HTMLAudioElement`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the
`postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook.
The audio view registers with `type: "audio"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The audio view does not embed child views.

---

## 8. CSP Requirements

**External network access required.** The `url` field typically points to an
external audio file. The host application's CSP must allow `media-src` (or
`default-src`) for the audio source origin.

---

## 9. Accessibility

- Play/pause button has an `aria-label` ("Play" or "Pause") that updates with state.
- Volume slider has an `aria-label` ("Volume").
- Time display uses `tabular-nums` for consistent width during updates.
- Region labels provide text descriptions of audio segments.
- The waveform canvas is interactive via click for seeking.

---

## 10. Size Budget

| Metric       | Target      |
|--------------|-------------|
| Raw          | < 200 KB    |
| Gzip         | < 60 KB     |

The bundle includes React, framer-motion, the shared UI library, and canvas
drawing logic. No additional audio processing libraries are included since the
View relies on the native `HTMLAudioElement`.

---

## 11. Test Cases

### Schema Validation (AJV)

- Accepts minimal valid input (`type`, `version`, `url`).
- Accepts full input with all optional fields.
- Rejects missing `url`.
- Rejects missing `type`.
- Rejects wrong `type`.
- Rejects wrong `version`.
- Rejects negative `duration`.
- Accepts `duration` of zero.
- Rejects waveform values above 1.
- Rejects waveform values below 0.
- Accepts empty waveform array.
- Rejects region with negative `start`.
- Accepts region without optional `label` and `color`.
- Rejects region missing required `id`.
- Accepts unknown additional fields (forward compatibility).

### Zod Validation

- Accepts minimal valid input.
- Accepts full input with all optional fields.
- Rejects missing `url`.
- Rejects missing `type`.
- Rejects wrong `type`.
- Rejects wrong `version`.
- Rejects negative `duration`.
- Rejects waveform values above 1.
- Rejects region with negative `start`.
- Accepts region without optional `label` and `color`.

### Rendering

- Canvas waveform renders bars from amplitude array.
- Played portion uses primary colour, unplayed uses muted colour.
- Playhead line drawn at current position.
- Region overlays render as coloured rectangles.
- Title renders when provided.
- Title is omitted when not provided.
- Play/pause button toggles state.
- Time display shows current / total.
- Volume slider adjusts playback volume.
- Click on waveform seeks to position.

### Theme

- Container background uses `--color-background`.
- Text colour uses `--color-foreground`.
- Played bars use `--color-primary`.
- Unplayed bars use `--color-muted`.

### Composition

- Renders correctly when receiving structuredContent via postMessage from a parent View.
- Handles re-render when parent sends updated structuredContent.
- Handles URL change by updating the audio source.

### Fallback

- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Incompatible `version` renders fallback with best-effort.
- Disconnected state shows "Connecting..." message.

---

## 12. Storybook Stories

Story file: `apps/audio/src/Audio.stories.tsx`

| Story          | Description                                              |
|----------------|----------------------------------------------------------|
| PodcastPlayer  | Audio player with waveform data and title                |
| WithRegions    | Waveform with labeled region overlays                    |
| MinimalPlayer  | Just a URL, no waveform data provided                    |
| AutoplayLoop   | Audio with autoplay and loop enabled                     |
