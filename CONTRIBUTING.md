# Contributing to chuk-mcp-ui

Thank you for your interest in contributing! This guide covers everything you need to create a new MCP View and submit it to the catalogue.

## Prerequisites

- Node.js 18+
- pnpm 9.15.4
- Basic knowledge of React 18, TypeScript, and Tailwind CSS 4

```bash
git clone https://github.com/chuk-ai/chuk-mcp-ui.git
cd chuk-mcp-ui
pnpm install
```

## Creating a New View

### 1. Scaffold

Use the built-in scaffolder to generate all 17 boilerplate files:

```bash
# Blank template
npx create-chuk-view my-view

# Pre-built patterns
npx create-chuk-view my-view --template=list
npx create-chuk-view my-view --template=detail
npx create-chuk-view my-view --template=wizard
```

### 2. Move into the monorepo

```bash
mv my-view apps/my-view
pnpm install
```

### 3. Develop

```bash
# Start dev server
pnpm --filter @chuk/view-my-view dev

# Run tests
pnpm --filter @chuk/view-my-view test

# Type-check
pnpm --filter @chuk/view-my-view type-check
```

### 4. Build

```bash
# SPA build → dist/mcp-app.html
pnpm --filter @chuk/view-my-view build
```

## View Architecture

Every view follows the **View + Renderer** pattern:

```
src/
├── mcp-app.tsx          # Entry: hydrateRoot or createRoot
├── App.tsx              # MyView (uses useView hook) + MyViewRenderer (pure props)
├── schema.ts            # TypeScript interface for data shape
├── zod.ts               # Runtime validation schema
├── ssr-entry.tsx         # Server-side rendering entry point
├── schema.test.ts        # JSON Schema validation tests
├── zod.test.ts           # Zod validation tests
└── MyView.stories.tsx    # Storybook story
```

### Key patterns

- **`useView<T>(type, version)`** connects to the MCP ext-apps protocol. It parses data from the URL hash (synchronous) and listens for postMessage updates.
- **`XxxRenderer`** is the pure component that takes `{ data: XxxContent }` props. Used by SSR and Storybook.
- **`XxxView`** calls `useView` and renders the Renderer. Used by the SPA entry point.
- **`ssr-entry.tsx`** exports `render(data)` which calls `renderToString(<XxxRenderer data={data} />)`.

### SSR requirements

All views must support SSR. The scaffolder generates `ssr-entry.tsx` and `vite.config.ssr.ts` automatically. The key requirements:

1. **`mcp-app.tsx`** must use conditional hydration:
   ```tsx
   if (rootEl.hasChildNodes()) {
     ReactDOM.hydrateRoot(rootEl, <StrictMode><MyView /></StrictMode>);
   } else {
     ReactDOM.createRoot(rootEl).render(<StrictMode><MyView /></StrictMode>);
   }
   ```

2. **`ssr-entry.tsx`** must export a `render(data)` function that returns an HTML string.

3. If your view depends on browser-only APIs (Canvas, WebGL, Leaflet), use a placeholder SSR that renders a loading state:
   ```tsx
   export function render(): string {
     return renderToString(
       <div className="h-full flex items-center justify-center text-muted-foreground">
         Loading my-view...
       </div>
     );
   }
   ```

## Schema Requirements

Every view needs three schema artifacts:

| File | Purpose |
|------|---------|
| `src/schema.ts` | TypeScript interface — the authoritative type |
| `src/zod.ts` | Zod schema for runtime validation |
| `schemas/input.json` | JSON Schema (Draft-07) for cross-language compatibility |

All three must stay in sync. The `type` field must match your view name and `version` must be `"1.0"`.

## Testing

### Required tests

1. **Schema validation** (`schema.test.ts`) — validates sample data against JSON Schema
2. **Zod validation** (`zod.test.ts`) — validates sample data with Zod

### Running tests

```bash
# Single view
pnpm --filter @chuk/view-my-view test

# All views
pnpm test

# Type-check everything
pnpm type-check
```

## Storybook

Every view must have at least one Storybook story. The story should:

- Use `parameters: { layout: "fullscreen" }` for views that fill their container
- Render the `Renderer` component directly (not the `View` wrapper)
- Include a `Default` story with minimal valid data

```bash
# Run Storybook locally
pnpm storybook

# Verify your story renders
# Open http://localhost:6006 and find your view under "Views/"
```

## Registering in the Catalogue

To appear in the View Catalogue at `mcp-views.chukai.io`:

1. Add your view's sample data to `apps/playground/src/samples.ts`
2. Add a registry entry to `apps/playground/src/catalogue-registry.ts`
3. Rebuild the playground: `pnpm --filter playground build`

## Pull Request Process

1. Create a feature branch from `main`
2. Implement your view following the patterns above
3. Ensure all checks pass:
   ```bash
   pnpm --filter @chuk/view-my-view test
   pnpm --filter @chuk/view-my-view type-check
   pnpm --filter @chuk/view-my-view build
   ```
4. Add sample data and catalogue entry
5. Submit a PR with:
   - Description of what the view does
   - Screenshot or demo
   - Confirmation that tests, type-check, and build all pass

## Code Style

- **TypeScript** — strict mode, no `any`
- **Tailwind CSS 4** — use utility classes, no custom CSS files unless absolutely necessary
- **`@chuk/view-ui`** — use shared UI components (Badge, Card, Button, etc.) where appropriate
- **No over-engineering** — keep views simple and focused on their purpose

## Project Layout

```
chuk-mcp-ui/
├── apps/                   # 69 view apps + playground + dashboard
│   └── <view>/
│       ├── src/            # View source code
│       ├── schemas/        # JSON Schema
│       ├── dist/           # Built SPA (mcp-app.html)
│       └── dist-ssr/       # Built SSR module
├── packages/
│   ├── shared/             # @chuk/view-shared — hooks, bus, theme
│   ├── ui/                 # @chuk/view-ui — design system
│   ├── ssr/                # Universal SSR bundle (all views)
│   └── create-chuk-view/   # View scaffolder
├── server.mjs              # Production server
├── storybook-static/       # Built Storybook
└── Dockerfile              # Production container
```

## Questions?

Open an issue on the repository or check the existing views in `apps/` for real-world examples of every pattern.
