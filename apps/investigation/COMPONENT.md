# @chuk/view-investigation

## Identity

- **Name:** @chuk/view-investigation
- **Type:** investigation
- **Version:** 1.0
- **Category:** Tier 3 — Compound
- **Description:** Investigative pinboard displaying evidence items as typed cards in a responsive grid with connection badges and optional notes.

## Dependencies

- **Runtime:** React 18, framer-motion, @chuk/view-shared, @chuk/view-ui
- **Build:** vite, vite-plugin-singlefile, typescript, @tailwindcss/vite
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

## Schema

### Input (structuredContent)

```typescript
interface InvestigationContent {
  type: "investigation";
  version: "1.0";
  title?: string;
  evidence: EvidenceItem[];
  connections?: Connection[];
  notes?: string;
}

interface EvidenceItem {
  id: string;
  label: string;
  type: "person" | "document" | "location" | "event" | "object";
  description?: string;
  image?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  strength?: "strong" | "medium" | "weak";
}
```

### Defaults

| Field | Default |
|-------|---------|
| title | `undefined` (header shows only counts) |
| connections | `undefined` (connections section hidden) |
| notes | `undefined` (notes section hidden) |
| evidence.description | `undefined` (description paragraph hidden) |
| evidence.image | `undefined` (image section hidden) |
| evidence.tags | `undefined` (tags row hidden) |
| evidence.metadata | `undefined` (metadata list hidden) |
| connection.label | `undefined` (plain arrow shown) |
| connection.strength | `"medium"` |

## Rendering

### Layout

Vertical layout filling the full iframe viewport height:

- **Header:** Title (optional), evidence count, and connection count summary.
- **Separator:** Horizontal divider between header and content.
- **Evidence grid:** Responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) of evidence cards with staggered entrance animation (`listContainer`/`listItem`).
- **Connections section:** Rendered below the grid when connections exist. Each connection is an inline badge showing `from -> to` labels with strength styling (solid/dashed/dotted borders).
- **Notes section:** Rendered below connections when notes exist. Displayed in a card with `whitespace-pre-wrap` text.

Each evidence card contains:
- Type-specific icon (person, document, location, event, object) with colour coding.
- Label with type badge.
- Optional description, image, tags (as secondary badges), and metadata key-value pairs.

Evidence type colour scheme:
- **person:** blue
- **document:** amber
- **event:** purple
- **location:** emerald
- **object:** rose

Connection strength styling:
- **strong:** solid border, medium font weight
- **medium:** dashed border, normal opacity
- **weak:** dotted border, muted text

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | Returns `null` until `data` is available from `useView`. |
| **Populated** | Evidence cards rendered in responsive grid with connections and notes below. |
| **Empty evidence** | Grid renders with no cards; header shows "0 evidence items". |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text via `font-sans` |
| `--chuk-color-text` | Card labels, connection labels (`text-foreground`) |
| `--chuk-color-text-secondary` | Descriptions, metadata, counts (`text-muted-foreground`) |
| `--chuk-color-background` | Root container |
| `--chuk-color-surface` | Card backgrounds |
| `--chuk-color-border` | Card borders, separator, connection badge borders |
| `--chuk-border-radius` | Card corners, badge corners, image corners |

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Scroll | Scroll within `ScrollArea` | Navigate through evidence grid and connections |

### Outbound Events (sendMessage)

None.

### Server Calls (callServerTool)

None.

### Action Templates

None.

## Model Context Updates

None.

## Display Mode

Not applicable. The View stays inline-only. No `requestDisplayMode` is used.

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

## Streaming

Not implemented. The View only renders on full `ontoolresult`.

## Composition

### As Child

When embedded in a composition container (dashboard, split, tabs), the investigation board fills its allocated panel. The responsive grid adapts column count based on available width.

### As Parent

Not applicable. `view-investigation` does not embed other Views.

### Cross-View Events

None.

## CSP Requirements

None. Fully self-contained. (Evidence `image` fields may reference external URLs but no specific domains are required by the view itself.)

## Accessibility

- Evidence cards use semantic heading structure within card content.
- Type icons are decorative; type is also communicated via text badge.
- Tags rendered as `Badge` components with readable text.
- Metadata key-value pairs use consistent layout for screen readers.
- Connection badges provide textual labels for relationships.
- Staggered animations respect `prefers-reduced-motion` via framer-motion defaults.

## Size Budget

**Target:** < 150KB gzip (React + framer-motion + app code)

## SSR Entry

- **File:** `apps/investigation/src/ssr-entry.tsx`
- **Renders:** `InvestigationRenderer` via `renderToString`
- **Config:** `apps/investigation/vite.config.ssr.ts`
- **Output:** `apps/investigation/dist-ssr/ssr-entry.js`

## Test Cases

- **Schema Validation:** Accepts valid `InvestigationContent` with evidence, connections, and notes.
- **Schema Validation:** Accepts minimal payload with empty `evidence` array and no optional fields.
- **Schema Validation:** Rejects missing `type` or `evidence` field.
- **Schema Validation:** Accepts unknown additional fields (forward compatibility).
- **Rendering:** Evidence cards render with correct type icons and colour coding.
- **Rendering:** Connection badges render with correct from/to labels and strength styling.
- **Rendering:** Notes section renders with pre-wrapped text when present; hidden when absent.
- **Rendering:** Responsive grid switches column count at breakpoints.
- **Fallback:** Returns `null` when `data` is absent.
- **Fallback:** Header shows "0 evidence items" when evidence array is empty.

## Storybook Stories

Story file: `apps/investigation/src/Investigation.stories.tsx`

| Story | Description |
|-------|-------------|
| ColdCase | Criminal investigation with 7 evidence items across all types, 7 connections, and investigator notes |
| ResearchProject | Academic research board for Bronze Age trade networks with 8 evidence items and 8 connections |
| SecurityAudit | Security incident investigation with events, documents, locations, and objects; 10 connections and remediation notes |
