# @chuk/view-tabs

## Identity
- **Name:** @chuk/view-tabs
- **Type:** tabs
- **Version:** 1.0
- **Category:** Tier 2 — Composition
- **Description:** Tabbed composition View with a tab bar for switching between child Views rendered in iframes.

## Dependencies
- **Runtime:** React 18
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Schema
```typescript
interface TabsContent {
  type: "tabs";
  version: "1.0";
  activeTab?: string;
  tabs: Tab[];
}

interface Tab {
  id: string;
  label: string;
  icon?: string;
  viewUrl: string;
  structuredContent: unknown;
}
```

## Defaults
| Field | Default |
|-------|---------|
| activeTab | first tab's id |

## Rendering
- Tab bar at top with border-bottom
- Active tab has colored bottom border and primary color text
- Tab panel fills remaining space
- Active tab's iframe gets structuredContent via postMessage on load
- Re-sends data when structuredContent changes (tab switch with same URL)

## Interactions
| Action | Trigger | Result |
|--------|---------|--------|
| Switch tab | Click tab button | Change active tab, load/show iframe |
| Tab loaded | iframe onLoad | postMessage structuredContent |

## Theme Integration
Uses: `--chuk-font-family`, `--chuk-color-background`, `--chuk-color-surface`, `--chuk-color-border`, `--chuk-color-primary`, `--chuk-color-text-secondary`.

## Composition
- **As Child:** Can be embedded in dashboard/split
- **As Parent:** Manages child Views in tab panels

## CSP
Depends on child Views.

## Size Budget
Target: < 150KB. Actual: 691 KB / 191 KB gzip (includes Tailwind CSS + shadcn/ui + Framer Motion)

## Test Cases

### Schema Validation
- MUST reject payload missing required `tabs` array
- MUST reject payload with empty `tabs` array
- MUST reject tab missing required `id`, `label`, or `viewUrl`
- MUST accept valid payload with all required fields
- MUST accept payload with optional `activeTab` and tab `icon` fields

### Tab Bar Rendering
- MUST render a tab button for each tab in the `tabs` array
- MUST display each tab's `label` text in its button
- MUST highlight the active tab with a colored bottom border
- MUST apply primary color text to the active tab
- MUST apply secondary color text to inactive tabs
- MUST render tab bar with a bottom border separator

### Tab Switching
- MUST default active tab to the first tab's id when `activeTab` is not specified
- MUST set active tab to the specified `activeTab` id when provided
- MUST switch active tab when a tab button is clicked
- MUST show the active tab's iframe and hide others
- MUST re-send structuredContent via postMessage when switching back to a previously loaded tab

### Message Delivery
- MUST postMessage structuredContent to active tab's iframe on load
- MUST send the correct structuredContent for each tab
- MUST re-send structuredContent when the content changes for the active tab

### Theme Integration
- MUST apply `--chuk-font-family` to tab labels
- MUST use `--chuk-color-background` for the component background
- MUST use `--chuk-color-surface` for tab panel background
- MUST use `--chuk-color-border` for tab bar border
- MUST use `--chuk-color-primary` for active tab indicator and text
- MUST use `--chuk-color-text-secondary` for inactive tab text

### Composition
- MUST render each tab's content as an iframe with the tab's `viewUrl` as src
- MUST support being embedded as a child in dashboard or split Views
- MUST isolate child Views within their own iframe contexts
- MUST handle dynamic tab count (single tab, many tabs)

## Storybook Stories

Story file: `apps/tabs/src/TabsView.stories.tsx`

| Story | Description |
|-------|-------------|
| ThreeTabs | Three tabs (Overview, Details, Settings) with tab switching |
