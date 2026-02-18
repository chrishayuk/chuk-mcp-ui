# Add Storybook: Component + View Stories

## Context

The design system (Tailwind v4 + shadcn/ui + Framer Motion) is deployed across all 10 Views. We need Storybook to visually verify components and Views, provide a development environment for tweaking, and serve as a living catalogue. Scope: both the 15 `packages/ui` primitives and the 10 View apps.

---

## Architecture

- **Storybook 8** with `@storybook/react-vite` (matches existing Vite toolchain)
- **Root-level** `.storybook/` config (spans both `packages/ui` and `apps/*`)
- **Colocated stories** — `*.stories.tsx` files next to source
- **Tailwind v4** via `@tailwindcss/vite` in Storybook's `viteFinal`
- **Theme toggle** — toolbar switcher sets `--chuk-*` CSS vars via `applyTheme()` from `@chuk/view-shared`
- **View stories** render inner components directly (e.g. `DataTable`, `DynamicForm`) with mock data, bypassing `useView` hook

---

## Files to Create

```
.storybook/
  main.ts              # Storybook config: Vite builder, story globs, addons, tailwindcss plugin
  preview.ts           # Global decorators, CSS import, theme toolbar, layout params
  theme-decorator.tsx  # Sets --chuk-* vars via applyTheme(), wraps in themed container
  mock-call-tool.ts    # Shared mock for onCallTool prop (logs to Actions panel)

packages/ui/src/components/
  button.stories.tsx      # 6 variants × 4 sizes, disabled, AllVariants grid
  badge.stories.tsx       # 4 variants
  card.stories.tsx        # With header/content/footer, minimal
  checkbox.stories.tsx    # Checked, unchecked, disabled, with label
  input.stories.tsx       # Text, email, password, number, disabled, placeholder
  label.stories.tsx       # Default, paired with input
  radio-group.stories.tsx # 3 options, disabled
  scroll-area.stories.tsx # Vertical overflow, horizontal
  select.stories.tsx      # Default, with placeholder, disabled
  separator.stories.tsx   # Horizontal, vertical
  slider.stories.tsx      # Default, custom range, disabled
  table.stories.tsx       # Basic table, with all column types
  tabs.stories.tsx        # 3-tab layout
  textarea.stories.tsx    # Default, placeholder, disabled
  tooltip.stories.tsx     # Default, all 4 sides

apps/datatable/src/DataTable.stories.tsx    # Default, WithActions, Empty, ManyRows
apps/form/src/DynamicForm.stories.tsx       # Minimal, WithGroups, AllWidgets
apps/chart/src/ChartRenderer.stories.tsx    # Bar, Line, Pie, Scatter, Area, Radar
apps/map/src/MapView.stories.tsx            # SingleLayer, Clustered, WithPopups
apps/markdown/src/Markdown.stories.tsx      # Basic, RichContent, CodeBlocks
apps/video/src/Video.stories.tsx            # WithUrl, WithPoster
apps/pdf/src/Pdf.stories.tsx                # WithUrl
apps/dashboard/src/Dashboard.stories.tsx    # 4-panel grid
apps/split/src/Split.stories.tsx            # Horizontal, Vertical
apps/tabs/src/TabsView.stories.tsx          # 3 tabs
```

## Files to Modify

| File | Change |
|------|--------|
| Root `package.json` | Add storybook devDeps + scripts |
| `.gitignore` | Add `storybook-static/` |
| `turbo.json` | Add `storybook` and `build-storybook` tasks |
| `packages/shared/src/theme.ts` | Export `LIGHT_DEFAULTS`, `DARK_DEFAULTS` |
| All 10 `apps/*/src/App.tsx` | Add `export` to inner component functions |

---

## Implementation

### 1. Install Storybook deps at root

Root `package.json` devDependencies:
```
storybook, @storybook/react, @storybook/react-vite,
@storybook/addon-essentials, @storybook/addon-a11y,
@storybook/blocks, @storybook/test
```

Root scripts: `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build -o storybook-static"`

### 2. Create `.storybook/main.ts`

- Story globs: `../packages/ui/src/**/*.stories.@(ts|tsx)`, `../apps/*/src/**/*.stories.@(ts|tsx)`
- Framework: `@storybook/react-vite`
- Addons: `@storybook/addon-essentials`, `@storybook/addon-a11y`
- `viteFinal`: add `tailwindcss()` plugin, `optimizeDeps.include` for Radix packages
- `docs.autodocs: "tag"`

### 3. Create `.storybook/preview.ts`

- Import `@chuk/view-ui/styles` (loads Tailwind + theme bridge)
- Register `themeDecorator`
- Global type: `theme` toolbar (light/dark toggle)
- Default layout: `centered` for components, Views override to `fullscreen`

### 4. Create `.storybook/theme-decorator.tsx`

- Import `applyTheme` from `@chuk/view-shared` (need to export `LIGHT_DEFAULTS`/`DARK_DEFAULTS` first)
- Read `context.globals.theme`, call `applyTheme(theme)`
- Wrap story in themed container div

### 5. Create `.storybook/mock-call-tool.ts`

- Use `fn()` from `@storybook/test` for Actions panel integration
- Signature: `async (name: string, args: Record<string, unknown>) => void`

### 6. Export inner components from View apps

Add `export` keyword to inner component functions in all 10 `apps/*/src/App.tsx`:

| App | Inner component to export |
|-----|--------------------------|
| datatable | `DataTable` + `DataTableProps` |
| form | `DynamicForm` + `DynamicFormProps` |
| chart | inner render component |
| dashboard | inner dashboard component |
| map | inner map component |
| markdown | inner markdown component |
| pdf | inner pdf component |
| split | inner split component |
| tabs | inner tabs component |
| video | inner video component |

### 7. Create 15 component stories

Each uses `Meta<typeof Component>` + `StoryObj` pattern with `tags: ["autodocs"]`, argTypes for variants/sizes, and an AllVariants grid story.

### 8. Create 10 View stories

Each imports the inner component + schema type, uses `mockCallTool`, provides sample `structuredContent` data. Layout set to `fullscreen` with fixed-height container decorator.

### 9. Update turbo.json

Add `storybook` (persistent, no cache) and `build-storybook` (cached, outputs `storybook-static/**`) tasks.

---

## Verification

1. `pnpm install` — new deps resolve
2. `pnpm storybook` — dev server starts on port 6006
3. Navigate component stories — all 15 components render with correct Tailwind styling
4. Toggle light/dark theme — components update via CSS variable cascade
5. Navigate View stories — all 10 Views render with sample data
6. Actions panel — clicking row actions / submitting forms logs to panel
7. `pnpm build-storybook` — static build succeeds
8. `pnpm build && pnpm test && pnpm type-check` — existing pipeline unaffected
