# Shipping 52 Interactive Views Over MCP ext-apps: What We Learned

## Context

[chuk-mcp-ui](https://github.com/chuk-ai/chuk-mcp-ui) is a monorepo of **52 standalone UI views** — charts, maps, dashboards, forms, polls, data tables, and more — each built as a single self-contained HTML file. The views integrate with LLMs through the [MCP ext-apps protocol](https://modelcontextprotocol.io/specification/draft/2025-03-26/server/utilities/ext-apps), which lets an MCP server deliver interactive web UIs alongside tool results.

We built a demo MCP server (`server.py`) that registers all 52 views as tools and resources, then deployed it to Fly.io for testing with Claude. The goal: type "show me a chart" in Claude and get a live, interactive chart rendered inline.

It didn't work on the first try. Or the fifth. Here's what we found.

---

## The Architecture

```
Claude (host)                    MCP Server (Fly.io)           CDN (Fly.io)
┌──────────────┐                ┌──────────────────┐          ┌───────────────┐
│              │  tools/list    │   52 @mcp.tool() │          │ 52 HTML files │
│  User types  │───────────────>│   functions       │          │ (single-file) │
│  "show chart"│                │                  │          │               │
│              │  tools/call    │  show_chart()    │          │ /chart/v1     │
│              │───────────────>│  → CallToolResult│          │ /map/v1       │
│              │                │    + structured  │          │ /poll/v1      │
│              │  resources/    │    Content       │  fetch   │ ...           │
│              │  read          │                  │─────────>│               │
│              │───────────────>│  Returns HTML    │<─────────│               │
│              │                │  from CDN cache  │          │               │
│  Renders UI  │<───────────────│                  │          │               │
│  in iframe   │  HTML + data   │                  │          │               │
└──────────────┘                └──────────────────┘          └───────────────┘
```

Each tool returns two things:
1. **`content`** — plain-text fallback for non-visual clients
2. **`structuredContent`** — typed JSON that the HTML view consumes (chart data, map layers, form fields, etc.)

The host (Claude) loads the HTML from a `resourceUri`, renders it in a sandboxed iframe, and passes `structuredContent` into it via the ext-apps SDK.

Each individual view is 500KB–1MB of self-contained HTML (React + Tailwind + view-specific libraries, all inlined via `vite-plugin-singlefile`). Well under any reasonable limit.

---

## Problem: "Failed to load MCP App: the resource may exceed the 5 MB size limit."

On first connect, Claude immediately failed with this error. No tool had been called. No chart was requested. The connection itself was enough to trigger the failure.

---

## Finding 1: Claude Pre-fetches All Resources at Connect Time

### What happens

When an MCP server connects, Claude sends `resources/list` and then immediately fetches **every** returned resource via `resources/read`. This is the ext-apps spec's "Host MAY prefetch and cache UI resource content" in action — Claude caches aggressively.

With 52 views registered as resources, each averaging ~730KB:

```
52 views x 730KB = ~38MB >> 5MB limit
```

The 5MB limit is applied to the aggregate, not per-resource.

### Evidence

Server logs showed the pattern clearly:

```
← ListResourcesRequest
→ [52 resources returned]
← ReadResourceRequest  uri=ui://view-demo/chart
← ReadResourceRequest  uri=ui://view-demo/map
← ReadResourceRequest  uri=ui://view-demo/dashboard
← ReadResourceRequest  uri=ui://view-demo/form
...  (52 total, all at connect time, before any tool call)
```

### Solution: Hide resources from `list_resources`

Resources must still be *registered* (so `resources/read` works when Claude fetches on-demand during a tool call), but they should not appear in `resources/list`.

```python
from mcp.server.fastmcp import FastMCP

class _QuietFastMCP(FastMCP):
    """FastMCP subclass that returns empty from list_resources.

    Resources are still registered and readable — but the host won't
    discover them upfront, preventing bulk pre-fetch.
    """
    async def list_resources(self):
        return []

mcp = _QuietFastMCP("view-demo", ...)
```

**Why a subclass?** FastMCP captures handler references at `__init__` time via an internal `_setup_handlers()` call. Setting `mcp.list_resources = lambda: []` after construction has no effect — the request router already points to the original method. The override must exist at class definition time.

### Result

No more bulk pre-fetch. Claude only fetches a resource when a tool is actually called and the response includes `_meta.ui.resourceUri`.

---

## Finding 2: FastMCP Silently Drops `structuredContent`

After fixing the pre-fetch issue, tools returned successfully — but Claude showed raw JSON text instead of rendering the interactive UI. The `structuredContent` was being lost somewhere between the tool function and the wire.

### Root cause

This is the critical finding. **When a FastMCP tool function returns a plain Python dict, the `structuredContent` field is silently discarded.**

FastMCP's result pipeline works like this:

```python
# Inside FastMCP (simplified)
def convert_result(result):
    if isinstance(result, CallToolResult):
        return result                    # Pass through as-is
    else:
        return _convert_to_content(result)  # Serialize to TextContent
```

When you return a dict:

```python
@mcp.tool()
async def show_chart(chart_type: str = "bar") -> dict:
    return {
        "content": [{"type": "text", "text": "Chart data."}],
        "structuredContent": {"type": "chart", "chartType": chart_type, ...},
    }
```

FastMCP calls `_convert_to_content()` on the *entire dict*, which serializes it as a single text string:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"content\": [{\"type\": \"text\", \"text\": \"Chart data.\"}], \"structuredContent\": {\"type\": \"chart\", ...}}"
    }
  ]
}
```

The `structuredContent` key becomes buried inside a JSON text blob. Claude never sees it as structured data. The UI never renders. There is no error, no warning — it just silently doesn't work.

### Solution: Return `CallToolResult` directly

```python
from mcp.types import CallToolResult, TextContent

@mcp.tool()
async def show_chart(chart_type: str = "bar") -> CallToolResult:
    structured = {
        "type": "chart",
        "version": "1.0",
        "chartType": chart_type,
        "data": [...]
    }
    return CallToolResult(
        content=[
            TextContent(type="text", text="Programming language popularity chart."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )
```

`CallToolResult` instances bypass `_convert_to_content()` entirely. Both `content` (text fallback) and `structuredContent` (typed data for the UI) reach the wire intact.

### Why both `content` and `structuredContent`?

- **`content`** — Required by the MCP spec. Provides a text fallback for hosts that don't support ext-apps. Also appears in Claude's conversation as the assistant's visible response.
- **`structuredContent`** — The typed payload that the HTML view consumes. This is what drives the interactive UI.

The pattern of including `json.dumps(structured)` as a second `TextContent` item means Claude can reason about the data even if the UI doesn't render.

### How we confirmed it

We built a minimal 1-tool test server:

```python
@mcp.tool()
async def show_chart(chart_type: str = "bar") -> CallToolResult:
    return CallToolResult(
        content=[TextContent(type="text", text="Chart.")],
        structuredContent={"type": "chart", "chartType": chart_type, "data": [...]},
    )
```

Deployed it. Called the tool in Claude. The chart rendered. That confirmed `structuredContent` was the issue, not resource fetching or MIME types or anything else.

---

## Finding 3: `viewUrl` Is Not in the ext-apps Spec

During debugging, we tried removing `resourceUri` from tool metadata and using `viewUrl` instead, hoping to bypass the resource system entirely and point Claude directly at the CDN.

**Result:** Claude showed the text content as raw text. No UI rendered.

**Why:** The `@modelcontextprotocol/ext-apps` TypeScript definitions only recognize `resourceUri` in `_meta.ui`:

```typescript
interface ToolResultUI {
  resourceUri: string;  // The only recognized field
}
```

`viewUrl` is not part of the spec. Claude ignores it. The resource must be registered on the server and discoverable via the `resourceUri` in tool metadata.

---

## Additional Findings

### MIME type must be `text/html;profile=mcp-app`

The ext-apps spec defines a specific MIME profile for MCP app resources. While `text/html` may work in some hosts, the spec-compliant MIME type is:

```python
mcp.resource(
    uri,
    name="Chart View",
    mime_type="text/html;profile=mcp-app",  # Not just "text/html"
    description="Interactive chart view",
)
```

### Fly.io session affinity matters

MCP's streamable-HTTP transport maintains server-side session state. All requests within a session must hit the same machine. Running 2+ Fly.io machines without session affinity causes:

```
MCP error 32600: Session terminated
```

Request A creates a session on machine 1. Request B lands on machine 2, which doesn't know about the session, returns 404, and the session is terminated.

**Fix:** Scale to 1 machine (`fly scale count 1 --app your-app`), or configure sticky sessions via `fly-replay` header.

### Use typed content objects, not plain dicts

Inside `CallToolResult.content`, use `TextContent(type="text", text=...)` instances rather than `{"type": "text", "text": ...}` dicts. Pydantic *may* auto-coerce in some SDK versions, but typed objects are more reliable and make the code self-documenting.

---

## The Debugging Journey

For anyone hitting similar issues, here's the order of operations that got us to a working state:

| Step | What We Tried | Outcome |
|------|---------------|---------|
| 1 | Deployed 52-tool server as-is | 5MB error on connect |
| 2 | Monkey-patched `mcp.list_resources = lambda: []` | No effect (handler captured at init) |
| 3 | Subclassed FastMCP, overrode `list_resources()` | Fixed pre-fetch, but still 5MB error |
| 4 | Removed `resourceUri`, used `viewUrl` only | No error, but no UI rendered |
| 5 | Restored `resourceUri` + subclass | 5MB error returned |
| 6 | Built 1-tool test server with plain dict return | Tool worked, but showed raw JSON |
| 7 | Changed test server to `CallToolResult` | **Chart rendered in Claude** |
| 8 | Applied `CallToolResult` to all 52 tools | **All views working** |

Steps 2–5 were chasing the wrong problem. The pre-fetch *was* an issue, but the `_QuietFastMCP` subclass alone wasn't enough because `structuredContent` was still being silently dropped. It was only after isolating with a 1-tool test server (step 6) that we discovered the real culprit.

---

## Summary: What MCP Server Developers Need to Know

### The Three Rules

1. **Always return `CallToolResult`** — never a plain dict — if your tool uses `structuredContent`. FastMCP will silently serialize your entire dict as text, discarding structured data.

2. **Control resource visibility.** If your server has many resources, override `list_resources()` to return an empty list (or a subset). Register resources normally so `resources/read` works on-demand, but don't let the host discover everything upfront.

3. **Use `resourceUri` in tool metadata.** Not `viewUrl`. The ext-apps spec only recognizes `resourceUri` for linking tools to their UI resources.

### Template: Minimal ext-apps Tool

```python
import json
from mcp.server.fastmcp import FastMCP
from mcp.types import CallToolResult, TextContent, ToolAnnotations

class _QuietFastMCP(FastMCP):
    async def list_resources(self):
        return []

mcp = _QuietFastMCP("my-server")

RESOURCE_URI = "ui://my-server/chart"

# Register the resource (fetchable via resources/read)
@mcp.resource(RESOURCE_URI, mime_type="text/html;profile=mcp-app")
async def chart_resource():
    # Return your single-file HTML here
    return "<html>...</html>"

# Register the tool with resourceUri in metadata
@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=True),
    meta={"ui": {"resourceUri": RESOURCE_URI}},
)
async def show_chart(chart_type: str = "bar") -> CallToolResult:
    """Show a chart. chart_type: bar, pie, or line."""
    structured = {
        "type": "chart",
        "version": "1.0",
        "chartType": chart_type,
        "data": [{"label": "Series", "values": [{"label": "A", "value": 10}]}],
    }
    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Showing {chart_type} chart."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

### Checklist

- [ ] Tools return `CallToolResult`, not `dict`
- [ ] Content items are `TextContent(...)`, not `{"type": "text", ...}`
- [ ] Resources use MIME type `text/html;profile=mcp-app`
- [ ] Tool metadata includes `meta={"ui": {"resourceUri": "ui://..."}}`
- [ ] `list_resources()` returns empty (or limited subset) for large servers
- [ ] Single Fly.io machine or session-affinity configured for streamable-HTTP
- [ ] `structuredContent` includes `type` and `version` fields matching the view's expectations
