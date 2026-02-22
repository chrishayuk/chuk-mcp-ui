"""
ChukMCPServer decorators for chuk View tools.

Drop-in replacement for fastmcp.py that targets ChukMCPServer.
The interface is identical — swap the import and everything works.

Usage:
    from chuk_view_schemas.chuk_mcp import map_tool, chart_tool, view_tool

    @map_tool(mcp, "show_sites")
    async def show_sites() -> MapContent:
        return MapContent(center={"lat": 51.5, "lon": -0.1}, layers=[...])
"""

from __future__ import annotations

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

# Re-use CDN constants and fallback generators from fastmcp
from .fastmcp import (
    CDN_BASE,
    VIEW_PATHS,
    _FALLBACK_GENERATORS,
    _generic_fallback,
    _get_cdn_url,
)

F = TypeVar("F", bound=Callable[..., Any])


def _view_tool(
    mcp_server: Any,
    tool_name: str,
    view_type: str,
    *,
    description: Optional[str] = None,
    read_only_hint: Optional[bool] = None,
    destructive_hint: Optional[bool] = None,
    idempotent_hint: Optional[bool] = None,
    open_world_hint: Optional[bool] = None,
    cdn_base: Optional[str] = None,
) -> Callable[[F], F]:
    """Core decorator factory targeting ChukMCPServer.

    Unlike the fastmcp variant, this:
    - Passes the explicit tool_name to mcp_server.tool(name=...)
    - Accepts individual hint kwargs (read_only_hint, etc.) matching
      ChukMCPServer's API instead of a monolithic ``annotations`` dict.
    """
    effective_cdn = cdn_base or CDN_BASE
    resource_uri = f"{effective_cdn}{VIEW_PATHS.get(view_type, f'/{view_type}/v1')}"

    meta = {"ui": {"resourceUri": resource_uri}}

    # Build kwargs for ChukMCPServer.tool()
    decorator_kwargs: dict[str, Any] = {"name": tool_name, "meta": meta}
    if description:
        decorator_kwargs["description"] = description
    if read_only_hint is not None:
        decorator_kwargs["read_only_hint"] = read_only_hint
    if destructive_hint is not None:
        decorator_kwargs["destructive_hint"] = destructive_hint
    if idempotent_hint is not None:
        decorator_kwargs["idempotent_hint"] = idempotent_hint
    if open_world_hint is not None:
        decorator_kwargs["open_world_hint"] = open_world_hint

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
