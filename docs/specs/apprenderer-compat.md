# AppRenderer Compatibility Spec (Phase 7)

## Overview

Verify that all 52 views render correctly in the `@mcp-ui/client` `AppRenderer` component used by MCP hosts. The goal is zero host-specific code in any view — if a host supports MCP Apps at all, chuk views just work.

---

## Background

The `@mcp-ui/client` package (published by the MCP working group) provides `AppRenderer`, the standard component hosts use to render ext-apps iframes. It handles:

- Creating and managing the iframe
- The `postMessage`-based ext-apps handshake
- Delivering `structuredContent` via `ontoolresult`
- Theme context propagation via `onhostcontextchanged`
- CSP enforcement

Different hosts may wrap `AppRenderer` differently or implement their own renderer. The compatibility work ensures chuk views work with both the reference implementation and known host-specific renderers.

---

## Known Hosts

| Host | Renderer | Status |
|------|----------|--------|
| Claude Desktop | Custom (ext-apps SDK) | Primary target — already tested |
| Claude Web | Custom (ext-apps SDK) | Primary target — already tested |
| Cursor | Unknown | Needs testing |
| Windsurf | Unknown | Needs testing |
| Cline | Unknown | Needs testing |
| Goose | `@mcp-ui/client` AppRenderer | Needs testing |
| mcp-cli | None (text only) | N/A — text fallback works |

---

## Test Matrix

### Per-View Tests

For each of the 52 views, verify:

| Check | Description |
|-------|-------------|
| Render | View loads without console errors |
| Data | `structuredContent` arrives and renders correctly |
| Theme (light) | Light theme applies, all tokens correct |
| Theme (dark) | Dark theme applies, all tokens correct |
| Interaction | User interactions work (click, scroll, input) |
| callServerTool | Tool calls dispatch correctly to host |
| sendMessage | Events emit correctly to host |
| CSP | No CSP violations in console |
| Resize | View adapts to container size changes |

### Host-Specific Tests

| Check | Description |
|-------|-------------|
| Handshake timing | View handles both fast and slow handshakes |
| Theme format | View handles different theme context shapes |
| Sandbox attrs | View works within `<iframe sandbox="...">` restrictions |
| Origin policy | `postMessage` origin validation works across hosts |

---

## Integration Test Harness

A standalone HTML page that loads `AppRenderer` and renders a single view with mock data. Used for automated testing outside any specific host.

**File:** `packages/shared/src/compat/test-harness.html`

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { AppRenderer } from "@mcp-ui/client";
    // Load view, deliver structuredContent, verify render
  </script>
</head>
<body>
  <div id="app-container"></div>
</body>
</html>
```

### Harness API

```typescript
interface TestHarnessConfig {
  viewUrl: string;              // URL of the view HTML
  structuredContent: unknown;   // Data to deliver
  theme?: "light" | "dark";    // Theme context
  viewport?: { width: number; height: number };
}
```

The harness is driven by Playwright for automated testing.

---

## Compatibility Shims

If host-specific quirks are discovered, optional shims live in `packages/shared/src/compat/`:

| File | Purpose |
|------|---------|
| `compat/index.ts` | Detection logic: which host is rendering this view? |
| `compat/shims/*.ts` | Per-host workarounds (only if needed) |

**Design principle:** Shims are a last resort. The preferred fix is always to make the view work with the standard protocol. Shims are only for documented host bugs that the view cannot work around otherwise.

### Host Detection

```typescript
export function detectHost(): "claude" | "cursor" | "goose" | "unknown" {
  // Check user-agent, postMessage origin, or handshake metadata
}
```

This function is **not** called by views directly. It's used by the test harness and by shims (if any exist).

---

## Acceptance Criteria

| # | Criterion |
|---|-----------|
| 1 | All 52 views render in `@mcp-ui/client` AppRenderer with zero console errors |
| 2 | Theme bridging works (light and dark) across all views |
| 3 | `callServerTool` dispatches correctly from all interactive views |
| 4 | No view contains host-specific branching code |
| 5 | Compatibility matrix published in docs with pass/fail per view per host |
| 6 | Test harness is automated and runs in CI |

---

## Deliverables

1. **Test harness** (`packages/shared/src/compat/test-harness.html`) — standalone AppRenderer test page
2. **Playwright test suite** — automated per-view tests against the harness
3. **Compatibility matrix** (published in `docs/`) — view x host pass/fail table
4. **Shims** (only if needed) — `packages/shared/src/compat/shims/`
5. **Documentation** — host-specific quirks documented in architecture.md

---

## Dependencies

- `@mcp-ui/client` — reference AppRenderer implementation
- `@playwright/test` — automated browser testing (shared with Phase 5.8 snapshot testing)
- Access to at least 3 different MCP hosts for manual verification

---

## Test Cases

| ID | Scenario | Expected |
|----|----------|----------|
| AR-01 | Render chart in AppRenderer with bar data | Chart renders, no errors |
| AR-02 | Render map in AppRenderer with GeoJSON | Map tiles load, markers visible |
| AR-03 | Theme switch light → dark in AppRenderer | All tokens update, no flicker |
| AR-04 | callServerTool from form submit | Host receives tool call |
| AR-05 | sendMessage from datatable row click | Host receives selection event |
| AR-06 | Resize AppRenderer container | View adapts layout |
| AR-07 | Slow handshake (2s delay) | View shows Fallback, then renders |
| AR-08 | CSP: view with external tiles (map) | Tiles load if CSP allows, graceful fallback if not |
| AR-09 | Multiple views in same page | Each view independent, no conflicts |
| AR-10 | View receives `update-structured-content` | Data updates in place |
