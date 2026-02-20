# ARCHITECTURE

Technical architecture reference for **chuk-mcp-ui**.

---

## 1. Overview

A monorepo of 52+ MCP (Model Context Protocol) ext-apps views. Each view is a standalone HTML app that renders structured data from LLM tool calls via the `@modelcontextprotocol/ext-apps` SDK.

```
chuk-mcp-ui/
  apps/              # 52 view apps (alert, chart, dashboard, map, ...)
  packages/
    shared/          # @chuk/view-shared  -- hooks, bus, theme, actions
    ui/              # @chuk/view-ui      -- Tailwind CSS v4 component library
    create-chuk-view/# scaffolding CLI
  types/             # shared TypeScript type declarations
  chuk-view-schemas/ # JSON schema definitions for structured content
```

---

## 2. View Lifecycle

1. **Host creates iframe** -- The host application (Claude Desktop, mcp-cli, or any MCP-compliant client) creates an `<iframe>` pointing to the view's HTML URL.
2. **View initializes hook** -- The view calls `useView<T>(type, version)` (or `useDashboardRuntime()` for the dashboard app).
3. **SDK handshake** -- `useApp()` from `@modelcontextprotocol/ext-apps` establishes a `postMessage` channel with the host.
4. **Host delivers data** -- The host fires `ontoolresult` with a `structuredContent` payload. The view receives typed data matching its declared schema.
5. **Reactive render** -- The view renders the data. Subsequent tool results or `update-structured-content` messages trigger re-renders in place.

---

## 3. Shared Package (`@chuk/view-shared`)

Source: `packages/shared/src/`

### Hooks

#### `useView<T>` (Core Hook)

File: `packages/shared/src/use-view.ts`

Wraps the ext-apps `useApp` hook. Responsibilities:

- Validates that `structuredContent.type` matches the expected view type.
- Applies the host theme via `applyTheme()` on `onhostcontextchanged`.
- Returns typed `data: T` and a `callTool()` function for invoking server-side MCP tools.
- Handles `update-structured-content` `postMessage` events for in-place panel updates without a full tool-result cycle.

#### Auxiliary Hooks

All hooks live in `packages/shared/src/hooks/`:

| Hook | Purpose |
|------|---------|
| `useViewResize` | Responsive breakpoint detection for adaptive layouts |
| `useViewUndo` | Undo/redo state management with history stack |
| `useViewStream` | Streaming content accumulation for progressive rendering |
| `useViewSelection` | Selection state management (single, multi, range) |
| `useViewFilter` | Filter state management with predicate composition |
| `useViewExport` | CSV generation and clipboard export |
| `useViewAuth` | Auth credential handling for protected resources |
| `useViewToast` | Toast notification queue |
| `useViewNavigation` | Navigation breadcrumb state for hierarchical views |
| `useViewLiveData` | Polling and SSE live data subscriptions |
| `useViewDrag` | Drag and drop between views |
| `useViewEvents` | Typed event emission (`select`, `deselect`, `filter-change`, `submit`, `action`, `draw`) via ViewBus |

### ViewBus

Source: `packages/shared/src/bus/`

Cross-view message bus built on `window.postMessage()`. All messages are enveloped with a `__chuk_bus` discriminator field to distinguish them from other `postMessage` traffic.

**Message types:**

`select` | `filter` | `highlight` | `navigate` | `drag-start` | `drag-end` | `drop` | `export-request` | `update`

**`ViewBusProvider`** (`ViewBusProvider.tsx`) sits at the dashboard level and routes messages between child iframes. It accepts a `filter` function that controls cross-view link routing -- only messages matching the filter are forwarded to a given iframe.

**Hook:** `useViewBus()` provides `send()` and `subscribe()` within individual views.

### Theme

File: `packages/shared/src/theme.ts`

`applyTheme(mode)` applies CSS custom properties (`--chuk-*`) to `document.documentElement` for light/dark modes. Every view calls this via the `onhostcontextchanged` callback so theme changes propagate instantly from the host.

---

## 4. Dashboard Runtime Architecture

Source: `apps/dashboard/src/`

The dashboard is a meta-view that orchestrates multiple child views in a single layout. It has its own runtime that manages state, layout, cross-view communication, and LLM interaction.

### Schema Versions

File: `apps/dashboard/src/schema.ts`

Three schema generations exist, each building on the previous:

- **v1.0 (`DashboardContentV1`)** -- Static layout. Specifies `grid`, `split-horizontal`, or `split-vertical` with explicit `viewUrl` per panel. No dynamic behavior.
- **v2.0 (`DashboardContentV2`)** -- Composable panels. Introduces `viewType` resolution, auto layout inference, `CrossViewLink[]` for inter-panel communication, `showWhen` conditional visibility, and custom view registries.
- **v3.0 (`UIPatch`)** -- Surgical patch operations applied to the runtime state store. The LLM emits patches rather than full dashboard definitions, enabling incremental UI mutations.

### View Registry (`view-registry.ts`)

Maps `viewType` strings to resolvable URLs. Resolution priority (highest to lowest):

1. `panel.viewUrl` -- explicit URL on the panel definition
2. `customRegistry[viewType]` -- user-provided registry overrides
3. `BUILT_IN_VIEWS[viewType]` -- hardcoded map of known view types
4. CDN fallback -- `${CDN_BASE}/${viewType}/v1`

### Auto Layout (`auto-layout.ts`)

Infers CSS grid configuration from the set of panel types:

| Panel count | Layout rule |
|-------------|-------------|
| 1 panel | Full width |
| 2 panels | 50/50 split (60/40 if one is a map) |
| Counter panels present | KPI strip row at top |
| Map + table + chart | Investigation preset |

Named presets (defined in `layout-presets.ts`): `map-sidebar`, `dashboard-kpi`, `investigation`, `report`, `compare`.

### Cross-View Links (`link-resolver.ts`)

Builds a `ViewBusProvider` filter function from `CrossViewLink[]` definitions. Supports `selection`, `filter`, `highlight`, `navigate`, and `update` link types with optional bidirectional routing.

### Panel Visibility (`use-panel-visibility.ts`)

Tracks panel visibility based on two mechanisms:

- `showWhen.linkedPanelHasSelection` -- a panel becomes visible only when a linked panel has an active selection.
- `collapsed` state -- collapsed panels render as compact expandable buttons rather than full iframes.

### UIStateStore (`state/ui-state-store.ts`)

Vanilla reactive store using a subscribe/notify pattern integrated with React via `useSyncExternalStore`. Holds the canonical `UIState`:

```typescript
UIState {
  version: string
  layout: LayoutConfig
  panels: PanelState[]
  links: CrossViewLink[]
}

PanelState {
  id: string
  label: string
  viewType: string
  viewUrl: string
  visible: boolean
  collapsed: boolean
  selection: unknown
  dataFingerprint: string
  loading: boolean
  error: string | null
  dataSummary: string
  structuredContent: unknown
}
```

Initialized from v2.0 dashboard data. All mutations flow through the patch engine.

### EventQueue (`state/event-queue.ts`)

Captures `postMessage` events from child iframes. Classification handles both ViewBus envelope (`__chuk_bus` discriminator) and legacy (`__chuk_panel_id`) patterns.

Queue policy by event type:

| Event type | Policy |
|-----------|--------|
| `select`, `deselect`, `submit`, `action`, `draw` | Always queued immediately |
| `filter-change` | 2-second debounce |
| `navigate` | Never queued |

### StateEmitter (`state/state-emitter.ts`)

Serializes `UIState` to compact JSON for the LLM context window. The serialized form:

- **Excludes** `structuredContent` (too large for conversation context).
- **Includes** `dataFingerprint` -- a 6-character DJB2 hash of the JSON-serialized content.
- **Includes** `dataSummary` -- a heuristic string (e.g., `"47 features, 2 layers"`, `"12 rows"`).

Pushes state to the host via `app.updateModelContext()` as XML tags:

```xml
<ui_state>{ ... }</ui_state>
<ui_events>[ ... ]</ui_events>
```

Rate-limited to 500ms intervals to avoid flooding the conversation context.

### PatchEngine (`state/patch-engine.ts`)

Supports 10 surgical operations:

| Operation | Description |
|-----------|-------------|
| `add-panel` | Insert a new panel into the layout |
| `remove-panel` | Remove a panel by ID |
| `update-panel` | Modify panel data (modes: `replace`, `merge`, `append`) |
| `show-panel` | Set panel visibility to true |
| `collapse-panel` | Toggle collapsed state |
| `add-link` | Create a new cross-view link |
| `remove-link` | Delete a cross-view link |
| `update-layout` | Change the grid/layout configuration |
| `set-loading` | Set loading state on a panel |
| `set-error` | Set error state on a panel |

`changedPanelIds()` compares fingerprints between old and new state for selective re-render -- only panels whose `structuredContent` actually changed receive a new `postMessage` with updated data.

### Runtime Hook (`use-dashboard-runtime.ts`)

Replaces `useView` for the dashboard view. Uses `useApp` directly with `capabilities: { tools: {} }`.

Key wiring:

- **`ontoolresult`**: Routes based on `type`:
  - `type: "dashboard"` -- initializes the UIStateStore from v2.0 content.
  - `type: "ui_patch"` -- applies patch operations via PatchEngine.
- **`ontoolinputpartial`**: Applies safe progressive operations (`add-panel`, `set-loading`) during LLM streaming, so panels appear incrementally before the full response completes.
- **`onlisttools` / `oncalltool`**: Registers a `get_ui_state` tool that the LLM can invoke to query current dashboard state.
- **`window.addEventListener("message")`**: Captures child iframe events, updates store selections, and triggers `app.sendMessage()` for high-priority events (`draw`, `submit`).

---

## 5. Data Flow

```
┌─────────────────────────────────────────────────────┐
│                  Host (Claude)                       │
│                                                      │
│  Conversation includes <ui_state> + <ui_events>      │
│  LLM reads state -> emits structuredContent          │
│                                                      │
│  ┌─────────────┐    ┌──────────────────┐            │
│  │ tool result  │───>│ app.ontoolresult │            │
│  │ type:ui_patch│    │ (dashboard)      │            │
│  └─────────────┘    └────────┬─────────┘            │
│                              │                       │
│  ┌─────────────┐    ┌───────▼─────────┐             │
│  │updateModel  │<───│  PatchEngine    │             │
│  │Context()    │    │  applies ops    │             │
│  └─────────────┘    └───────┬─────────┘             │
│         ▲                    │                       │
│         │            ┌──────▼──────────┐            │
│         │            │  UIStateStore   │            │
│   ┌─────┴──────┐     │  (canonical)    │            │
│   │ State      │     └───────┬─────────┘            │
│   │ Emitter    │             │                      │
│   │ (500ms)    │      ┌──────▼──────────┐           │
│   └─────┬──────┘      │  React render   │           │
│         │             │  (useSyncExt)   │           │
│         │             └───────┬─────────┘           │
│         │                     │                     │
│   ┌─────┴──────┐      ┌──────▼──────────┐          │
│   │ Event      │<─────│  Panel iframes  │          │
│   │ Queue      │      │  (postMessage)  │          │
│   └────────────┘      └─────────────────┘          │
└─────────────────────────────────────────────────────┘
```

**Cycle explained:**

1. The LLM emits a tool result containing `structuredContent` (either a full dashboard definition or a `ui_patch`).
2. `ontoolresult` in the dashboard runtime receives the payload.
3. PatchEngine applies operations to the UIStateStore.
4. React re-renders via `useSyncExternalStore`, updating panel iframes.
5. Panel iframes emit user interaction events via `postMessage`.
6. EventQueue captures and classifies these events.
7. StateEmitter serializes current state and pushes it to the host via `updateModelContext()`.
8. The LLM sees updated `<ui_state>` and `<ui_events>` in its conversation context and can respond with further patches.

---

## 6. Design System (`@chuk/view-ui`)

Source: `packages/ui/src/`

Built on **Tailwind CSS v4**. Uses CSS custom properties for light/dark theming that align with the `applyTheme()` system from `@chuk/view-shared`.

### Components

`button` | `badge` | `card` | `checkbox` | `input` | `label` | `radio-group` | `scroll-area` | `select` | `separator` | `slider` | `table` | `tabs` | `textarea` | `tooltip`

Each component has a corresponding `.stories.tsx` file for Storybook development and visual testing. The theme bridge (`styles/theme.css`) maps runtime `--chuk-*` CSS variables to Tailwind v4 `@theme` tokens. Shared animation variants live in `animations/`.

---

## 7. Build

### Per-View Build

Each view app uses **Vite** with `vite-plugin-singlefile` to produce a single self-contained HTML file. All CSS, JavaScript, and assets are inlined. This is required for the ext-apps iframe model -- the host loads a single URL that contains everything needed to render the view.

### Monorepo Orchestration

- **Turborepo** (`turbo.json`) orchestrates builds across all 52+ apps and shared packages with dependency-aware caching and parallel execution.
- **pnpm workspaces** (`pnpm-workspace.yaml`) manage package resolution across the monorepo.

### TypeScript

A shared `tsconfig.base.json` at the root provides common compiler options. Individual packages and apps extend it.

### Serving and Deployment

A `server.mjs` at the root serves built view HTML files. Deployment is configured for Fly.io (`fly.toml`, `Dockerfile`). Views are accessible at `https://chuk-mcp-ui-views.fly.dev/{view-name}/v{major}`.
