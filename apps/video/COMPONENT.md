# Component Spec: @chuk/view-video

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-video`                                                    |
| Type        | `video`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | HTML5 video player View that renders a `<video>` element with native browser controls. Supports autoplay, muted playback, looping, poster images, and start time seeking. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |
| Build    | vite                                    | `^6.0.0`      |
| Build    | vite-plugin-singlefile                  | `^2.0.0`      |
| Build    | typescript                              | `^5.7.0`      |
| Build    | `@vitejs/plugin-react`                  | `^4.3.0`      |
| Protocol | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |

---

## 3. Schema

### 3.1 Root -- `VideoContent`

```typescript
interface VideoContent {
  type: "video";
  version: "1.0";
  url: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  startTime?: number;
}
```

### 3.2 Defaults

| Field       | Default     |
|-------------|-------------|
| `title`     | `undefined` (title bar is not rendered) |
| `autoplay`  | `undefined` (browser default: no autoplay) |
| `muted`     | `undefined` (browser default: unmuted) |
| `loop`      | `undefined` (browser default: no loop) |
| `poster`    | `undefined` (no poster image) |
| `startTime` | `undefined` (playback starts at 0:00) |

---

## 4. Rendering

### 4.1 Layout

Optional title bar at the top (`px-3 py-2`, 15px font-semibold, bottom border).
Below that, a flex-1 container centres the `<video>` element both horizontally
and vertically with 8px padding and `overflow-hidden`.

The `<video>` element is constrained with `max-w-full max-h-full` and has
rounded corners (`rounded-md`). Native browser controls are always enabled
via the `controls` attribute.

The container uses a flex column layout filling 100% height.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. Falls back to plain text display of raw content. |
| Populated   | Full HTML5 video player with native browser controls.                   |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background.                            |
| `--color-border`             | Title bottom border.                             |

### 4.4 Start Time Handling

When `startTime` is provided, the component registers a `loadedmetadata` event
listener on the `<video>` element. Once metadata is loaded (duration and
dimensions are available), `video.currentTime` is set to the specified start
time in seconds. The listener is cleaned up on unmount or when `startTime`
changes.

---

## 5. Interactions

### 5.1 User Actions

| Action         | Trigger                    | Result                                               |
|----------------|----------------------------|------------------------------------------------------|
| Play/Pause     | Click play button or video | Toggles playback via native browser controls.        |
| Seek           | Drag progress bar          | Seeks to position via native browser controls.       |
| Volume         | Adjust volume slider       | Changes volume via native browser controls.          |
| Fullscreen     | Click fullscreen button    | Enters fullscreen mode via native browser controls.  |
| Picture-in-Picture | Right-click menu       | Browser-dependent PiP support via native controls.   |

All interactions are provided by the native HTML5 `<video>` element with the
`controls` attribute. The View does not implement custom playback controls.

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`. No progressive
rendering via `ontoolinputpartial`. The video source URL is set once and
playback is handled natively by the browser.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the
`postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook.
The video view registers with `type: "video"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The video view does not embed child views.

---

## 8. CSP Requirements

**External network access required.** The `url` field typically points to an
external video file. The host application's CSP must allow `media-src` (or
`default-src`) for the video source origin.

If `poster` is provided, the CSP must also allow `img-src` for the poster
image origin.

---

## 9. Accessibility

- Native browser `<video>` controls provide built-in keyboard navigation (space for play/pause, arrow keys for seeking).
- Native controls include accessible labels for play, pause, volume, fullscreen, and seek.
- The `poster` attribute provides a visual preview before playback begins.
- The `muted` attribute is respected by browsers for autoplay policies (most browsers require `muted` for autoplay to work without user interaction).

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 150 KB    | 542 KB              |
| Gzip         | --          | 144 KB              |

The bundle is primarily React and the shared UI component library. No
additional video processing libraries are included since the View relies
entirely on the native HTML5 `<video>` element.

---

## 11. Test Cases

### Schema Validation

- Accepts valid VideoContent with `type`, `version`, and `url`.
- Accepts minimal schema: `type`, `version`, `url`.
- Accepts optional `title` field.
- Accepts optional `autoplay` field.
- Accepts optional `muted` field.
- Accepts optional `loop` field.
- Accepts optional `poster` field.
- Accepts optional `startTime` field.
- Rejects missing `type` field.
- Rejects missing `version` field.
- Rejects missing `url` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Video element renders with `src` attribute matching `data.url`.
- Video element has `controls` attribute.
- Title renders in header bar when provided.
- Title is omitted when not provided.
- Video element has `autoPlay` when `autoplay` is true.
- Video element has `muted` when `muted` is true.
- Video element has `loop` when `loop` is true.
- Video element has `poster` attribute when `poster` is provided.
- Video is constrained to container with `max-w-full max-h-full`.
- Video has rounded corners.

### Interaction

- Start time is applied after metadata loads when `startTime` is set.
- `loadedmetadata` event listener is cleaned up on unmount.
- `loadedmetadata` event listener is cleaned up when `startTime` changes.
- Native browser controls handle play/pause.
- Native browser controls handle seeking.
- Native browser controls handle volume adjustment.
- Native browser controls handle fullscreen toggle.

### Theme

- Container background uses `--color-background`.
- Text colour uses `--color-foreground`.
- Title border uses `--color-border`.

### Composition

- Renders correctly when receiving structuredContent via postMessage from a parent View.
- Handles re-render when parent sends updated structuredContent.
- Handles URL change by updating the video source.

### Fallback

- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Incompatible `version` renders fallback with best-effort.
- Disconnected state shows "Connecting..." message.

### Accessibility

- Native `<video>` controls provide keyboard navigation.
- Native controls include accessible labels.
- Poster image provides visual preview.
- Muted attribute supports autoplay policies.

---

## 12. Storybook Stories

Story file: `apps/video/src/Video.stories.tsx`

| Story     | Description                                        |
|-----------|----------------------------------------------------|
| WithUrl   | HTML5 video player with sample video                |
| WithPoster| Video with muted playback and poster image          |
