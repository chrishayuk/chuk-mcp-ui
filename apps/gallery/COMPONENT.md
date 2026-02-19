# Component Spec: @chuk/view-gallery

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-gallery`                                                  |
| Type        | `gallery`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Card grid gallery View that displays items as thumbnail cards with optional filtering, sorting, badges, metadata, and action buttons via `callTool`. |

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

### 3.1 Root -- `GalleryContent`

```typescript
interface GalleryContent {
  type: "gallery";
  version: "1.0";
  title?: string;
  items: GalleryItem[];
  columns?: 1 | 2 | 3 | 4;
  filterable?: boolean;
  sortable?: boolean;
  sortFields?: string[];
  emptyMessage?: string;
}

interface GalleryItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: { url: string; alt?: string };
  badges?: GalleryBadge[];
  metadata?: Record<string, string>;
  actions?: GalleryAction[];
}

interface GalleryBadge {
  label: string;
  variant?: "default" | "secondary" | "outline";
}

interface GalleryAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}
```

### 3.2 Defaults

| Field          | Default                                          |
|----------------|--------------------------------------------------|
| `title`        | `undefined` (toolbar title not rendered)         |
| `columns`      | `undefined` (responsive via `useViewResize`)     |
| `filterable`   | `undefined` (filter input not rendered)          |
| `sortable`     | `undefined` (sort dropdown not rendered)         |
| `sortFields`   | `[]`                                             |
| `emptyMessage` | `"No items found"`                               |
| `badge.variant`| `"default"`                                      |
| `image.alt`    | Falls back to item `title`                       |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column layout:

1. **Toolbar** (conditional): Title on the left, filter `Input` and sort `Select` dropdown on the right. Separated by bottom border.
2. **Grid area** (`ScrollArea`): CSS Grid with `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` when no explicit `columns` prop, or `repeat(N, minmax(0, 1fr))` when columns is set. Gap of 16px. Padding 16px.
3. **Footer**: Item count display "{filtered} of {total} items".

Each card is a `Card` component containing:
- **Image** (optional): `aspect-ratio: 16/9`, `object-cover`, rounded top via card overflow hidden.
- **CardContent**: Title (`font-semibold`), subtitle (`text-sm text-muted-foreground`), description (`text-sm`, 2-line clamp via `line-clamp-2`), badges row (`Badge` components), metadata key-value pairs.
- **CardFooter**: Action buttons (`Button variant="outline" size="sm"`).

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full grid of cards with toolbar and footer.                             |
| No matches  | Displays `emptyMessage` or "No items found" centered in grid area.      |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text, card title.                           |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Subtitle, metadata labels, footer text.          |
| `--color-border`             | Toolbar and footer borders, card borders.        |
| `--color-primary`            | Default badge variant.                           |

### 4.4 Animation

- `listContainer` variant on the grid element for staggered child entry.
- `listItem` variant on each card wrapper for individual fade-in with slide-up.
- `fadeIn` variant on the empty state.

---

## 5. Interactions

### 5.1 User Actions

| Action         | Trigger                  | Result                                                |
|----------------|--------------------------|-------------------------------------------------------|
| Filter         | Type in filter input     | Items filtered by title, subtitle, and description.   |
| Sort           | Select sort field        | Items sorted by selected metadata field value.        |
| Click action   | Click card action button | Calls `callTool(action.tool, action.arguments)`.      |

### 5.2 Filtering

Filter is implemented via `useMemo`. The search term is matched (case-insensitive) against each item's `title`, `subtitle`, and `description` fields. Only items containing the search term in any of these fields are displayed.

### 5.3 Sorting

Sort is implemented via `useMemo`. Items are sorted alphabetically by the value of the selected metadata field using `String.localeCompare`. Items missing the metadata field sort to the beginning.

### 5.4 Outbound Events (sendMessage)

None currently implemented.

### 5.5 Server Calls (callServerTool)

Action buttons invoke `callTool` with the action's `tool` name and `arguments` object.

---

## 6. Responsive Behaviour

When `columns` is not explicitly set, the grid uses `auto-fill` with a `240px` minimum column width. Additionally, `useViewResize` provides breakpoint-aware column counts as a fallback:

| Breakpoint | Columns |
|------------|---------|
| `xs`       | 1       |
| `sm`       | 2       |
| `md`       | 3       |
| `lg`/`xl`  | 4       |

---

## 7. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 8. Composition

### 8.1 As Child

Works inside dashboard, split, and tabs containers.

### 8.2 As Parent

Not applicable.

---

## 9. CSP Requirements

External network access may be required if `image.url` points to an external origin. The host application's CSP must allow `img-src` for image origins.

---

## 10. Accessibility

- Cards use semantic structure with heading-level text for titles.
- Images include `alt` text (falls back to item title).
- Filter input is a native `<input>` element with placeholder text.
- Action buttons are native `<button>` elements with visible labels.
- Footer provides item count for screen readers.

---

## 11. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 12. Test Cases

### Schema Validation

- Accepts minimal valid GalleryContent with items array.
- Accepts full gallery with all optional fields.
- Accepts all badge variants: default, secondary, outline.
- Accepts empty items array.
- Rejects missing items.
- Rejects wrong type.
- Rejects missing version.
- Rejects item missing id.
- Rejects item missing title.
- Rejects invalid column count.
- Accepts unknown additional fields.

### Rendering

- Title renders in toolbar when provided.
- Filter input renders when `filterable` is true.
- Sort dropdown renders when `sortable` is true with `sortFields`.
- Cards render with correct structure.
- Images render with aspect-ratio 16/9.
- Badges render with correct variants.
- Metadata key-value pairs render.
- Action buttons render in card footer.
- Empty state displays when no items match filter.
- Footer shows correct item counts.

### Interaction

- Filter narrows displayed items by title/subtitle/description.
- Sort reorders items by selected metadata field.
- Action buttons call callTool with correct arguments.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 13. Storybook Stories

Story file: `apps/gallery/src/Gallery.stories.tsx`

| Story          | Description                                                      |
|----------------|------------------------------------------------------------------|
| ProductCatalog | 8 products with images, prices, badges, "Add to Cart" actions   |
| TeamDirectory  | 6 people with avatars, role badges, "View Profile" actions       |
| SearchResults  | 4 results without images, metadata fields, sortable              |
