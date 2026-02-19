"""
FastMCP decorators for chuk View tools.

Usage:
    from chuk_view_schemas.fastmcp import map_tool, chart_tool, view_tool
    
    @map_tool(mcp, "show_sites")
    async def show_sites() -> MapContent:
        return MapContent(center={"lat": 51.5, "lon": -0.1}, layers=[...])
"""

from __future__ import annotations

import json
from functools import wraps
from typing import Any, Callable, Optional, TypeVar

from pydantic import BaseModel

from .chart import ChartContent
from .dashboard import DashboardContent
from .datatable import DataTableContent
from .form import FormContent
from .map import MapContent
from .markdown import MarkdownContent
from .pdf import PdfContent
from .split import SplitContent
from .tabs import TabsContent
from .video import VideoContent

# CDN URL registry
CDN_BASE = "https://chuk-mcp-ui-views.fly.dev"

VIEW_PATHS: dict[str, str] = {
    "map": "/map/v1",
    "chart": "/chart/v1",
    "datatable": "/datatable/v1",
    "form": "/form/v1",
    "markdown": "/markdown/v1",
    "video": "/video/v1",
    "pdf": "/pdf/v1",
    "dashboard": "/dashboard/v1",
    "split": "/split/v1",
    "tabs": "/tabs/v1",
    "detail": "/detail/v1",
    "counter": "/counter/v1",
    "code": "/code/v1",
    "progress": "/progress/v1",
    "confirm": "/confirm/v1",
    "json": "/json/v1",
    "status": "/status/v1",
}


def _get_cdn_url(view_type: str) -> str:
    path = VIEW_PATHS.get(view_type, f"/{view_type}/v1")
    return f"{CDN_BASE}{path}"


# Text fallback generators
def _map_fallback(data: MapContent) -> str:
    n = sum(len(l.features.get("features", [])) if isinstance(l.features, dict) else 0 for l in data.layers)
    names = ", ".join(l.label for l in data.layers)
    return f"Map with {n} features across {len(data.layers)} layers ({names})."


def _chart_fallback(data: ChartContent) -> str:
    labels = ", ".join(ds.label for ds in data.data)
    return f"Chart: {data.title or 'Untitled'} ({labels})."


def _datatable_fallback(data: DataTableContent) -> str:
    return f"Table: {data.title or 'Untitled'} — {len(data.rows)} rows, {len(data.columns)} columns."


def _form_fallback(data: FormContent) -> str:
    return f"Form: {data.title or 'Untitled'}."


def _markdown_fallback(data: MarkdownContent) -> str:
    preview = data.content[:200].replace("\n", " ").strip()
    return f"{data.title or 'Document'}: {preview}..."


def _video_fallback(data: VideoContent) -> str:
    return f"Video: {data.title or data.url}"


def _pdf_fallback(data: PdfContent) -> str:
    return f"PDF: {data.title or data.url}"


def _dashboard_fallback(data: DashboardContent) -> str:
    return f"Dashboard: {data.title or 'Untitled'} — {len(data.panels)} panels."


def _split_fallback(data: SplitContent) -> str:
    return f"Split view ({data.direction or 'horizontal'})."


def _tabs_fallback(data: TabsContent) -> str:
    names = ", ".join(t.label for t in data.tabs)
    return f"Tabs: {names}."


def _generic_fallback(data: Any) -> str:
    view_type = getattr(data, "type", "unknown") if isinstance(data, BaseModel) else "unknown"
    return f"Showing {view_type} view."


_FALLBACK_GENERATORS: dict[type, Callable[..., str]] = {
    MapContent: _map_fallback,
    ChartContent: _chart_fallback,
    DataTableContent: _datatable_fallback,
    FormContent: _form_fallback,
    MarkdownContent: _markdown_fallback,
    VideoContent: _video_fallback,
    PdfContent: _pdf_fallback,
    DashboardContent: _dashboard_fallback,
    SplitContent: _split_fallback,
    TabsContent: _tabs_fallback,
}


F = TypeVar("F", bound=Callable[..., Any])


def _view_tool(
    mcp_server: Any,
    tool_name: str,
    view_type: str,
    *,
    description: Optional[str] = None,
    annotations: Any = None,
    cdn_base: Optional[str] = None,
) -> Callable[[F], F]:
    """Core decorator factory."""
    effective_cdn = cdn_base or CDN_BASE
    resource_uri = f"{effective_cdn}{VIEW_PATHS.get(view_type, f'/{view_type}/v1')}"

    meta = {"ui": {"resourceUri": resource_uri}}

    decorator_kwargs: dict[str, Any] = {"meta": meta}
    if description:
        decorator_kwargs["description"] = description
    if annotations:
        decorator_kwargs["annotations"] = annotations

    def decorator(func: F) -> F:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> dict:
            result = await func(*args, **kwargs)

            if isinstance(result, BaseModel):
                structured = result.model_dump(by_alias=True)
                fallback_gen = _FALLBACK_GENERATORS.get(type(result), _generic_fallback)
                fallback_text = fallback_gen(result)
            elif isinstance(result, dict):
                if "structuredContent" in result:
                    return result
                structured = result
                fallback_text = f"Showing {view_type} view."
            else:
                raise TypeError(
                    f"Expected BaseModel or dict, got {type(result).__name__}"
                )

            return {
                "content": [{"type": "text", "text": fallback_text}],
                "structuredContent": structured,
            }

        mcp_server.tool(**decorator_kwargs)(wrapper)
        return func  # type: ignore

    return decorator  # type: ignore


# Per-View convenience decorators

def map_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a map View."""
    return _view_tool(mcp, name, "map", **kwargs)


def chart_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a chart View."""
    return _view_tool(mcp, name, "chart", **kwargs)


def datatable_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a datatable View."""
    return _view_tool(mcp, name, "datatable", **kwargs)


def form_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a form View."""
    return _view_tool(mcp, name, "form", **kwargs)


def markdown_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a markdown View."""
    return _view_tool(mcp, name, "markdown", **kwargs)


def video_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a video View."""
    return _view_tool(mcp, name, "video", **kwargs)


def pdf_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a PDF View."""
    return _view_tool(mcp, name, "pdf", **kwargs)


def dashboard_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a dashboard View."""
    return _view_tool(mcp, name, "dashboard", **kwargs)


def split_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a split View."""
    return _view_tool(mcp, name, "split", **kwargs)


def tabs_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a tabs View."""
    return _view_tool(mcp, name, "tabs", **kwargs)


def detail_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a detail View."""
    return _view_tool(mcp, name, "detail", **kwargs)


def counter_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a counter View."""
    return _view_tool(mcp, name, "counter", **kwargs)


def code_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a code View."""
    return _view_tool(mcp, name, "code", **kwargs)


def progress_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a progress View."""
    return _view_tool(mcp, name, "progress", **kwargs)


def confirm_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a confirm View."""
    return _view_tool(mcp, name, "confirm", **kwargs)


def json_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a JSON View."""
    return _view_tool(mcp, name, "json", **kwargs)


def status_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a status View."""
    return _view_tool(mcp, name, "status", **kwargs)


def view_tool(mcp: Any, name: str, view_type: str, **kwargs: Any) -> Callable[[F], F]:
    """Generic decorator for any view type."""
    return _view_tool(mcp, name, view_type, **kwargs)
