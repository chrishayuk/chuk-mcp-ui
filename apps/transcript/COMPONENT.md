# Component Spec: @chuk/view-transcript

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-transcript`                                               |
| Type        | `transcript`                                                          |
| Version     | `1.0`                                                                 |
| Category    | Text                                                                  |
| Description | Timestamped speaker-labelled text display with search and speaker colors. |

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

### 3.1 Root -- `TranscriptContent`

```typescript
interface TranscriptContent {
  type: "transcript";
  version: "1.0";
  title?: string;
  description?: string;
  entries: TranscriptEntry[];
  speakers?: SpeakerInfo[];
  /** Show search bar */
  searchable?: boolean;
  /** Show timestamps */
  showTimestamps?: boolean;
}
```

### 3.2 `TranscriptEntry`

```typescript
interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  /** ISO timestamp or seconds offset */
  timestamp?: string;
  /** Duration in seconds */
  duration?: number;
  /** Confidence score 0-1 */
  confidence?: number;
  /** Language code */
  language?: string;
}
```

### 3.3 `SpeakerInfo`

```typescript
interface SpeakerInfo {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  role?: string;
}
```

### 3.4 Defaults

| Field            | Default       |
|------------------|---------------|
| `title`          | `undefined`   |
| `description`    | `undefined`   |
| `speakers`       | `undefined`   |
| `searchable`     | `undefined` (treated as true) |
| `showTimestamps` | `true`        |
| `timestamp`      | `undefined`   |
| `duration`       | `undefined`   |
| `confidence`     | `undefined`   |
| `language`       | `undefined`   |
| `color`          | auto-assigned from palette |
| `avatar`         | `undefined`   |
| `role`           | `undefined`   |

---

## 4. Rendering

### 4.1 Layout

Full-height scrollable container with centered content column (`max-w-[700px]`).

- **Header**: Optional title (`text-lg font-semibold`) and description (`text-sm text-muted-foreground`).
- **Speaker legend**: Horizontal flex with color dots (or avatar images), speaker names, and optional roles. Shown when `speakers` array is provided.
- **Search bar**: `Input` component with "Search transcript..." placeholder. Filters entries by text content or speaker name. Shown unless `searchable` is explicitly `false`.
- **Entries list**: Vertical stack (`space-y-3`) of transcript entries.
- **Summary footer**: Entry count and speaker count (`text-xs text-muted-foreground`).

### 4.2 Entry Row

Each entry is a horizontal flex row with three columns:

| Column        | Width      | Content                                                        |
|---------------|------------|----------------------------------------------------------------|
| Timestamp     | `w-14`     | Mono-spaced time string (`mm:ss` for numeric, locale time for ISO). Hidden when `showTimestamps` is false. |
| Speaker bar   | `w-1`      | Rounded vertical color bar in the speaker's assigned color.    |
| Content       | `flex-1`   | Speaker name (colored, `font-semibold`), confidence badge (if < 0.8), language tag, and text body. |

### 4.3 Speaker Colors

Speakers with explicit `color` use that value. Others are auto-assigned from a 10-color palette in order of appearance. Colors are stable across re-renders via `useMemo`.

### 4.4 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Returns `null` (no data yet).                                           |
| Empty       | Shows header and "0 of 0 entries" summary.                              |
| No matches  | Shows "No entries match" message when search filters all entries.       |
| Populated   | Full transcript with all entries displayed.                              |

---

## 5. Interactions

### 5.1 User Actions

| Action          | Trigger          | Result                                                     |
|-----------------|------------------|------------------------------------------------------------|
| Search          | Type in search   | Filters entries by text content or speaker name.           |
| Clear search    | Clear input      | Restores all entries.                                      |

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

Not implemented.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- Search input is a native `<input>` element with placeholder text.
- Speaker names use semantic color for visual distinction.
- Timestamps use monospace font for alignment.
- Confidence scores include `title` attribute with full percentage.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `TranscriptRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal transcript with empty entries array.
- Accepts full transcript with all optional fields (title, description, speakers, timestamps, durations, confidence, language).
- Accepts entries with ISO timestamps.
- Rejects wrong type.
- Rejects missing type, version, or entries.
- Rejects entry missing required fields (id, speaker, text).
- Rejects speaker missing required fields (id, name).

### Rendering

- Speaker names colored with assigned or explicit colors.
- Timestamps formatted as mm:ss for numeric values, locale time for ISO strings.
- Confidence badge shown only when confidence < 0.8.
- Language tag shown when present.
- Search filters entries by text and speaker name.
- Speaker legend shows avatars or color dots.

### Interaction

- Search input filters entries in real time.
- Clearing search restores all entries.
- "No entries match" message shown when search yields no results.

---

## 12. Storybook Stories

Story file: `apps/transcript/src/Transcript.stories.tsx`

| Story         | Description                                                     |
|---------------|-----------------------------------------------------------------|
| Interview     | 2 speakers with seconds timestamps, search enabled, 6 entries   |
| MeetingNotes  | 3 speakers with ISO timestamps, search disabled, 4 entries      |
