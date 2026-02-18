# chuk-mcp-ui Design System

Tailwind CSS v4 + shadcn/ui + Framer Motion

---

## Stack Overview

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Utility CSS | Tailwind CSS v4 | ^4.0.0 | Styling via `@tailwindcss/vite` plugin |
| Component primitives | shadcn/ui + Radix UI | latest | 15 accessible, source-owned components |
| Animation | Framer Motion | ^11.0.0 | Declarative enter/exit animations (opt-in) |
| Utility function | clsx + tailwind-merge | ^2.x | `cn()` for conditional class composition |

---

## Theme Architecture

### CSS Variable Flow

```
Host (Claude, ChatGPT, etc.)
  │
  ▼  theme context via postMessage
applyTheme()  (packages/shared/theme.ts)
  │
  ▼  sets CSS custom properties on document.documentElement
--chuk-color-background, --chuk-color-text, --chuk-color-primary, etc.
  │
  ▼  referenced by @theme directive
theme.css  (packages/ui/src/styles/theme.css)
  │
  ▼  generates Tailwind tokens
--color-background, --color-foreground, --color-primary, etc.
  │
  ▼  used by utility classes
bg-background, text-foreground, text-primary, border-border, etc.
```

### Token Mapping

| --chuk-* Variable | Tailwind Token | Utility Classes |
|-------------------|---------------|-----------------|
| `--chuk-color-background` | `--color-background` | `bg-background` |
| `--chuk-color-text` | `--color-foreground` | `text-foreground` |
| `--chuk-color-primary` | `--color-primary` | `bg-primary`, `text-primary` |
| `--chuk-color-surface` | `--color-muted` | `bg-muted`, `text-muted-foreground` |
| `--chuk-color-border` | `--color-border` | `border-border` |
| `--chuk-color-text-secondary` | `--color-muted-foreground` | `text-muted-foreground` |
| `--chuk-font-family` | `--font-family-sans` | `font-sans` |
| `--chuk-border-radius` | `--radius-md` | `rounded-md` |

### Dark Mode

Dark mode is automatic. When `applyTheme("dark")` is called, it updates the `--chuk-*` CSS variable values. Since Tailwind tokens reference these via `var()`, all utility classes update instantly. No `.dark` class toggling needed.

---

## Component Catalogue

All components live in `packages/ui/src/components/` and are exported from `@chuk/view-ui`.

### Form Components

| Component | Radix Primitive | Usage |
|-----------|----------------|-------|
| `Button` | Slot | Actions, submit, navigation |
| `Input` | — | Text, number, date, password fields |
| `Label` | Label | Form field labels |
| `Textarea` | — | Multi-line text input |
| `Checkbox` | Checkbox | Boolean toggles |
| `RadioGroup` + `RadioGroupItem` | RadioGroup | Single-select from options |
| `Slider` | Slider | Numeric range input |
| `Select` + `SelectTrigger/Content/Item/Value` | Select | Dropdown selection |

### Layout Components

| Component | Radix Primitive | Usage |
|-----------|----------------|-------|
| `Card` + `CardHeader/Content/Footer/Title` | — | Content containers, panels |
| `Table` + `TableHeader/Body/Row/Head/Cell` | — | Data tables |
| `Tabs` + `TabsList/Trigger/Content` | Tabs | Tabbed interfaces |
| `ScrollArea` + `ScrollBar` | ScrollArea | Scrollable containers |
| `Separator` | Separator | Visual dividers |

### Feedback Components

| Component | Radix Primitive | Usage |
|-----------|----------------|-------|
| `Badge` | — | Status indicators, tags |
| `Tooltip` + `TooltipTrigger/Content/Provider` | Tooltip | Hover information |

### Usage

```typescript
import {
  Button,
  Input,
  Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  ScrollArea,
  cn,
} from "@chuk/view-ui";
```

### Button Variants

```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="secondary">Secondary</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Conditional Classes with cn()

```tsx
<div className={cn(
  "border-b transition-colors",
  isActive && "bg-primary/15",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

---

## Animation Patterns

Animations are opt-in. Views add `framer-motion` to their own `package.json` to use them. Views that skip it pay zero bundle cost.

### Shared Variants

Import from `@chuk/view-ui/animations`:

```typescript
import { fadeIn, slideUp, listContainer, listItem, tabPanel, pressable } from "@chuk/view-ui/animations";
```

| Variant | Description | Usage |
|---------|-------------|-------|
| `fadeIn` | Opacity 0→1 | Content panels, page entrance |
| `slideUp` | Fade + translate Y | Form submit, notifications |
| `listContainer` + `listItem` | Stagger children | Table rows, card grids |
| `tabPanel` | Horizontal slide + fade | Tab content switching |
| `pressable` | Scale on hover/tap | Interactive buttons |
| `collapseExpand` | Height animation | Collapsible sections |

### Shared Transitions

```typescript
import { springSnappy, easeOut, easeInOut } from "@chuk/view-ui/animations";
```

| Transition | Config | Usage |
|-----------|--------|-------|
| `springSnappy` | `type: "spring", stiffness: 500, damping: 30` | Buttons, toggles |
| `easeOut` | `duration: 0.2` | Fades, slides |
| `easeInOut` | `duration: 0.3` | Page transitions |

### Example: Animated Content

```tsx
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";

<motion.div variants={fadeIn} initial="hidden" animate="visible">
  <Table>...</Table>
</motion.div>
```

---

## Adding a New View

Step-by-step process for creating a new View that uses the design system.

### 1. Scaffold the View

```bash
mkdir -p apps/my-view/src
```

### 2. package.json

```json
{
  "name": "@chuk/view-my-view",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/mcp-app.html",
  "dependencies": {
    "@chuk/view-shared": "workspace:*",
    "@chuk/view-ui": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "vite-plugin-singlefile": "^2.0.0",
    "typescript": "^5.7.0"
  }
}
```

Add `framer-motion: "^11.0.0"` to dependencies only if you need animations.

### 3. vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: { input: "mcp-app.html" },
  },
});
```

Plugin order matters: `react()` → `tailwindcss()` → `viteSingleFile()`.

### 4. mcp-app.tsx (entry point)

```typescript
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";  // <-- Required: loads Tailwind + theme bridge
import { MyView } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MyView />
  </StrictMode>
);
```

### 5. App.tsx

```typescript
import { useView, Fallback } from "@chuk/view-shared";
import { Button, Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { MyViewContent } from "./schema";

export function MyView() {
  const { data, content, callTool, isConnected } =
    useView<MyViewContent>("my-view", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return (
    <div className="flex flex-col h-full font-sans text-foreground bg-background">
      <motion.div variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold">{data.title}</h2>
            <Button onClick={() => callTool("my-tool", { id: data.id })}>
              Action
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
```

### 6. Install and Build

```bash
pnpm install
pnpm build --filter=@chuk/view-my-view
```

Verify `dist/mcp-app.html` exists with all CSS inlined.

---

## Adding a New Component to packages/ui

### 1. Create the Component

```bash
# packages/ui/src/components/my-component.tsx
```

Follow the shadcn/ui pattern:
- Use `forwardRef` for DOM elements
- Use `cn()` for class merging
- Use `cva()` for variants (if needed)
- Accept `className` prop for composition

### 2. Export from Barrel

Add to `packages/ui/src/index.ts`:

```typescript
export { MyComponent } from "./components/my-component";
```

### 3. Use in Views

```typescript
import { MyComponent } from "@chuk/view-ui";
```

---

## Styling Guidelines

### Do

- Use Tailwind utility classes: `className="flex items-center gap-2 p-4"`
- Use theme tokens: `bg-background`, `text-foreground`, `text-primary`, `border-border`
- Use `cn()` for conditional classes: `cn("base", condition && "active")`
- Keep dynamic/data-driven values in `style` props: `style={{ flex: ratio }}`

### Don't

- Don't use inline `style={{}}` for static styling — use Tailwind classes
- Don't import `CSS_VARS` from shared — use Tailwind token classes instead
- Don't create `const styles: Record<string, React.CSSProperties>` blocks
- Don't hardcode colors — always reference theme tokens

### Dynamic Values

Some values come from data and can't be Tailwind classes. Use inline styles for these:

```tsx
// Data-driven flex ratio — must be inline
<div style={{ flex: panel.width }}>

// Data-driven badge color — must be inline
<Badge className="text-white" style={{ backgroundColor: badgeColor }}>

// Data-driven gap — must be inline
<div className="flex" style={{ gap: `${data.gap}px` }}>
```

---

## Bundle Sizes

| View | Bundle Size | Uses Framer Motion |
|------|------------|-------------------|
| datatable | 810 KB | Yes |
| form | 809 KB | Yes |
| map | 754 KB | No |
| chart | 745 KB | No |
| pdf | 692 KB | No |
| dashboard | 692 KB | Yes |
| tabs | 691 KB | Yes |
| split | 691 KB | No |
| markdown | 583 KB | No |
| video | 542 KB | No |

All sizes are for the single-file `mcp-app.html` with CSS, JS, and assets inlined.

---

## Storybook

The design system is documented with 72 interactive stories across 25 groups, browsable at `localhost:6006`.

### Running

| Command | Description |
|---------|-------------|
| `pnpm storybook` | Dev server with hot reload on port 6006 |
| `pnpm build-storybook` | Static build to `storybook-static/` |

### Story Organisation

| Tier | Location | Count | Description |
|------|----------|-------|-------------|
| Component | `packages/ui/src/components/*.stories.tsx` | 48 stories (15 groups) | shadcn/ui primitives: variants, sizes, states |
| View | `apps/*/src/*.stories.tsx` | 24 stories (10 groups) | Full View rendering with mock data |

### Theme Toggle

A toolbar switcher applies `applyTheme("light" | "dark")` from `@chuk/view-shared`, so every story can be previewed in both themes. The decorator wraps each story in a `bg-background text-foreground font-sans` container.

### Writing Stories

Stories are colocated next to their source files. Follow this pattern:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "./my-component";

const meta = {
  title: "Components/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Click me" },
};
```

View stories render the inner component directly (e.g. `DataTable`, `DynamicForm`) with mock data, bypassing `useView`. Views with `onCallTool` pass `mockCallTool` from `.storybook/mock-call-tool.ts`.

### Conventions

- `satisfies Meta<typeof Component>` for type safety
- `tags: ["autodocs"]` for auto-generated docs pages
- `parameters: { layout: "fullscreen" }` for View stories
- 600px height decorator wrapper for View stories
- Stories excluded from `tsconfig.json` type-checking (`"exclude": ["src/**/*.stories.tsx"]`)

---

## Package Responsibilities

| Package | Owns | Does NOT Own |
|---------|------|-------------|
| `packages/shared` | App protocol, `useView` hook, `applyTheme()`, `Fallback`, template resolver | Components, styling, animations |
| `packages/ui` | shadcn components, Tailwind theme bridge, animation variants, `cn()` | Protocol, data fetching, business logic |
| `apps/*` | View-specific rendering, schema types, Zod validation | Shared components, theme infrastructure |
