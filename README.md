# chuk-mcp-ui

A monorepo of **52 standalone MCP (Model Context Protocol) UI views**, each built as a single-file HTML app with Vite + vite-plugin-singlefile. Views communicate with LLMs through the MCP ext-apps protocol and with each other through the ViewBus cross-view message bus.

## Getting Started

**Prerequisites:** Node.js 18+ and pnpm 9.15.4

```bash
# Install dependencies
pnpm install

# Build all packages and apps
pnpm build

# Launch Storybook dev server
pnpm storybook

# Run tests
pnpm test

# TypeScript type-check
pnpm type-check
```

## Project Structure

```
chuk-mcp-ui/
├── apps/
│   ├── dashboard/     # Composable dashboard + runtime engine
│   ├── map/           # Leaflet map view
│   ├── datatable/     # Data table view
│   ├── chart/         # Chart.js chart view
│   ├── form/          # Dynamic form view
│   ├── ...            # 47 more view apps
│   └── playground/    # Dev playground
├── packages/
│   ├── shared/        # @chuk/view-shared — hooks, ViewBus, theme
│   └── ui/            # @chuk/view-ui — design system components
├── .storybook/        # Storybook v8.5 config
├── turbo.json
└── package.json
```

## Architecture

### Single-File Views

Every app produces a self-contained HTML file. Each view calls `useView<T>()` from `@chuk/view-shared` to connect to the MCP ext-apps protocol.

### ext-apps Protocol

Views interact with the LLM runtime through three channels:

- **`app.updateModelContext()`** — push UI state into the model context
- **`app.sendMessage()`** — send high-priority events to the host
- **`app.oncalltool`** — expose state that the LLM can query on demand

### ViewBus

A cross-view message bus enabling panels to communicate through `select`, `filter`, `highlight`, and `navigate` events. This is the backbone of multi-view coordination inside the dashboard.

### Dashboard Runtime

The dashboard view is a composable layout engine with three capability tiers:

| Tier | Capability |
|------|------------|
| **v1.0** | Static grid/split layout with explicit `viewUrls` |
| **v2.0** | Composable panels with `viewType` resolution, auto layout, cross-view links, conditional panels |
| **v3.0** | Conversation-driven UI runtime: UIStateStore, EventQueue, PatchEngine, StateEmitter |

### Packages

| Package | npm Name | Description |
|---------|----------|-------------|
| `packages/shared` | `@chuk/view-shared` | `useView` hook, ViewBus, theme utilities |
| `packages/ui` | `@chuk/view-ui` | Design system (button, badge, card, checkbox, input, label, radio-group, scroll-area, select, separator, slider, table, tabs, textarea, tooltip) built with Tailwind CSS v4 |

## Available Views

### Core (17)
`map` `datatable` `chart` `form` `markdown` `video` `pdf` `dashboard` `split` `tabs` `detail` `counter` `code` `progress` `confirm` `json` `status`

### Interactive (10)
`compare` `gallery` `ranked` `poll` `quiz` `chat` `image` `log` `timeline` `tree`

### Developer (7)
`alert` `diff` `embed` `filter` `kanban` `settings` `stepper`

### Data Visualization (10)
`gauge` `heatmap` `crosstab` `scatter` `boxplot` `timeseries` `treemap` `sunburst` `pivot` `profile`

### Specialist (7)
`audio` `carousel` `terminal` `gis-legend` `layers` `minimap` `spectrogram`

## Development

```bash
# Dev mode (all apps + packages in watch mode)
pnpm dev

# Build everything via Turborepo
pnpm build

# Run all tests
pnpm test

# TypeScript strict checking
pnpm type-check

# Storybook dev server on port 6006
pnpm storybook

# Static Storybook build
pnpm build-storybook

# Clean all build artifacts
pnpm clean
```

Each app under `apps/` is an independent Vite project. To work on a single view, run `pnpm dev` from within that app directory.
