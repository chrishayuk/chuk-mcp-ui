# Component Spec: @chuk/view-ranked

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-ranked`                                                   |
| Type        | `ranked`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Ranked / prioritised list View that displays items with numeric scores, rank positions, optional delta indicators, score bars, badges, metadata, images, and action buttons via `callTool`. |

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

## 3. Schema

### 3.1 Root -- `RankedContent`

```typescript
interface RankedContent {
  type: "ranked";
  version: "1.0";
  title?: string;
  items: RankedItem[];
  maxScore?: number;
  showDelta?: boolean;
  scoreLabel?: string;
  scoreSuffix?: string;
}

interface RankedItem {
  id: string;
  rank: number;
  title: string;
  subtitle?: string;
  score: number;
  previousRank?: number;
  badges?: RankedBadge[];
  metadata?: Record<string, string>;
  image?: { url: string; alt?: string };
  actions?: RankedAction[];
}

interface RankedBadge {
  label: string;
  variant?: "default" | "secondary" | "outline";
}

interface RankedAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}
```

### 3.2 Defaults

| Field          | Default                                      |
|----------------|----------------------------------------------|
| `title`        | `undefined` (header row not rendered)        |
| `maxScore`     | Computed from `Math.max(...items.score)`     |
| `showDelta`    | `false` (delta indicators hidden)            |
| `scoreLabel`   | `undefined` (not rendered)                   |
| `scoreSuffix`  | `""` (no suffix after score value)           |
| `item.subtitle`| `undefined` (not rendered)                   |
| `item.previousRank` | `undefined` (delta indicator hidden)    |
| `item.badges`  | `undefined` (badge row not rendered)         |
| `item.metadata`| `undefined` (metadata row not rendered)      |
| `item.image`   | `undefined` (not rendered)                   |
| `item.actions` | `undefined` (action buttons not rendered)    |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column (`h-full flex flex-col`). Header area with title and score label. Scrollable list area using `ScrollArea`. Each item renders as a `Card` row containing:

1. **Rank number** -- 48px wide, `text-2xl font-bold`, coloured by rank position (gold/silver/bronze for top 3, `text-muted-foreground` otherwise).
2. **Delta indicator** -- Shown when `showDelta` is `true` and `previousRank` is present. Green up-arrow for improvement, red down-arrow for decline, gray dash for unchanged.
3. **Optional image** -- 40x40px, rounded, `object-cover`.
4. **Content area** -- Title (`font-semibold`), subtitle (`text-muted-foreground`), badges row, metadata key-value pairs.
5. **Score bar** -- `bg-muted` track with `bg-primary` fill. Width = `(score / maxScore) * 100%`. Score value and suffix displayed to the right.
6. **Action buttons** -- `Button` components with `variant="outline"` and `size="sm"`.

### 4.2 Top 3 Rank Colours

| Rank | Colour Class     | Meaning |
|------|------------------|---------|
| 1    | `text-amber-500` | Gold    |
| 2    | `text-gray-400`  | Silver  |
| 3    | `text-amber-700` | Bronze  |
| 4+   | `text-muted-foreground` | Default |

### 4.3 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full ranked list with score bars and all item details.                  |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.4 Animation

Uses `listContainer` and `listItem` variants from `@chuk/view-ui/animations` for staggered list entry. Header uses `fadeIn` variant.

### 4.5 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Rank numbers (4+), subtitles, metadata labels.   |
| `--color-muted`              | Score bar track background.                      |
| `--color-primary`            | Score bar fill.                                  |
| `--color-border`             | Card borders.                                    |

---

## 5. Interactions

### 5.1 User Actions

| Action        | Trigger         | Result                                           |
|---------------|-----------------|--------------------------------------------------|
| Click action  | Click button    | Calls `callTool(action.tool, action.arguments)`. |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

Action buttons invoke `callTool` with the action's `tool` name and `arguments` object.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

---

## 8. CSP Requirements

External network access may be required if `item.image.url` points to an external origin. The host application's CSP must allow `img-src` for image origins.

---

## 9. Accessibility

- Semantic heading structure (h1 for title).
- Rank numbers provide visual hierarchy.
- Buttons are native `<button>` elements with visible labels.
- Delta indicators use colour plus shape (arrow direction) for non-colour-dependent meaning.
- Images include `alt` text (falls back to item title).

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid RankedContent with required fields.
- Accepts full RankedContent with all optional fields.
- Accepts all badge variants: default, secondary, outline.
- Rejects missing items.
- Rejects missing type.
- Rejects wrong type.
- Rejects missing version.
- Rejects item missing required id.
- Rejects item missing required score.
- Accepts unknown additional fields.

### Rendering

- Title renders as h1 when provided.
- Score label renders as subtitle text.
- Items render as Card rows with rank numbers.
- Top 3 ranks display gold/silver/bronze colours.
- Delta indicators render when showDelta is true and previousRank is present.
- Score bars fill proportionally to maxScore.
- Badges render with correct variants.
- Metadata key-value pairs render.
- Images render when provided.
- Action buttons render.

### Interaction

- Action buttons call callTool with correct tool name and arguments.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/ranked/src/Ranked.stories.tsx`

| Story           | Description                                                       |
|-----------------|-------------------------------------------------------------------|
| SearchResults   | 10 items, relevance scores 0-100, metadata, scoreSuffix: "%"     |
| Leaderboard     | 5 items, avatars, delta indicators, scoreSuffix: " pts"          |
| Recommendations | 6 items, images, badges, "View Details" action with mockCallTool |
