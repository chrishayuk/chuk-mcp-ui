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

# Re-use CDN constants from fastmcp
from .fastmcp import (
    CDN_BASE,
    VIEW_PATHS,
)

F = TypeVar("F", bound=Callable[..., Any])


def _has_view_tool(mcp_server: Any) -> bool:
    """Check if the server has a view_tool method (ChukMCPServer >= 0.24)."""
    return callable(getattr(mcp_server, "view_tool", None))


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
    permissions: Optional[dict[str, Any]] = None,
    csp: Optional[dict[str, Any]] = None,
    visibility: Optional[list[str]] = None,
    prefers_border: Optional[bool] = None,
    cdn_base: Optional[str] = None,
) -> Callable[[F], F]:
    """Core decorator factory targeting ChukMCPServer.

    Unlike the fastmcp variant, this:
    - Uses ``mcp_server.view_tool()`` when available (ChukMCPServer >= 0.24)
      for automatic resource registration, permissions, CSP, and visibility.
    - Falls back to ``mcp_server.tool(meta={...})`` for older servers.
    - Passes the explicit tool_name to mcp_server.tool(name=...)
    - Accepts individual hint kwargs (read_only_hint, etc.) matching
      ChukMCPServer's API instead of a monolithic ``annotations`` dict.
    """
    effective_cdn = cdn_base or CDN_BASE
    view_path = VIEW_PATHS.get(view_type, f"/{view_type}/v1")
    view_url = f"{effective_cdn}{view_path}"

    # Use ui:// scheme for resourceUri; actual URL goes in viewUrl
    server_name = (
        getattr(getattr(mcp_server, "protocol", None), "server_info", None)
        and mcp_server.protocol.server_info.name
    ) or getattr(mcp_server, "name", "mcp-server")
    resource_uri = f"ui://{server_name}/{view_type}"

    def decorator(func: F) -> F:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> dict:
            result = await func(*args, **kwargs)

            if isinstance(result, BaseModel):
                structured = result.model_dump(by_alias=True, exclude_none=True)
            elif isinstance(result, dict):
                if "structuredContent" in result:
                    return result
                structured = result
            else:
                raise TypeError(
                    f"Expected BaseModel or dict, got {type(result).__name__}"
                )

            return {"structuredContent": structured}

        if _has_view_tool(mcp_server):
            # Use ChukMCPServer's @view_tool for automatic resource
            # registration, permissions, CSP, and visibility.
            vt_kwargs: dict[str, Any] = {
                "resource_uri": resource_uri,
                "view_url": view_url,
                "name": tool_name,
            }
            if description:
                vt_kwargs["description"] = description
            if permissions is not None:
                vt_kwargs["permissions"] = permissions
            if csp is not None:
                vt_kwargs["csp"] = csp
            if visibility is not None:
                vt_kwargs["visibility"] = visibility
            if prefers_border is not None:
                vt_kwargs["prefers_border"] = prefers_border
            mcp_server.view_tool(**vt_kwargs)(wrapper)
        else:
            # Fallback: build meta dict manually for older servers.
            ui_meta: dict[str, Any] = {
                "resourceUri": resource_uri,
                "viewUrl": view_url,
            }
            if permissions is not None:
                ui_meta["permissions"] = permissions
            if csp is not None:
                ui_meta["csp"] = csp
            if visibility is not None:
                ui_meta["visibility"] = visibility
            if prefers_border is not None:
                ui_meta["prefersBorder"] = prefers_border

            meta = {"ui": ui_meta}
            tool_kwargs: dict[str, Any] = {"name": tool_name, "meta": meta}
            if description:
                tool_kwargs["description"] = description
            if read_only_hint is not None:
                tool_kwargs["read_only_hint"] = read_only_hint
            if destructive_hint is not None:
                tool_kwargs["destructive_hint"] = destructive_hint
            if idempotent_hint is not None:
                tool_kwargs["idempotent_hint"] = idempotent_hint
            if open_world_hint is not None:
                tool_kwargs["open_world_hint"] = open_world_hint
            mcp_server.tool(**tool_kwargs)(wrapper)

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


def gallery_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a gallery View."""
    return _view_tool(mcp, name, "gallery", **kwargs)


def tree_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a tree View."""
    return _view_tool(mcp, name, "tree", **kwargs)


def timeline_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a timeline View."""
    return _view_tool(mcp, name, "timeline", **kwargs)


def log_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a log View."""
    return _view_tool(mcp, name, "log", **kwargs)


def image_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns an image View."""
    return _view_tool(mcp, name, "image", **kwargs)


def compare_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a compare View."""
    return _view_tool(mcp, name, "compare", **kwargs)


def chat_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a chat View."""
    return _view_tool(mcp, name, "chat", **kwargs)


def ranked_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a ranked View."""
    return _view_tool(mcp, name, "ranked", **kwargs)


def quiz_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a quiz View."""
    return _view_tool(mcp, name, "quiz", **kwargs)


def poll_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a poll View."""
    return _view_tool(mcp, name, "poll", **kwargs)


def alert_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns an alert View."""
    return _view_tool(mcp, name, "alert", **kwargs)


def stepper_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a stepper View."""
    return _view_tool(mcp, name, "stepper", **kwargs)


def filter_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a filter View."""
    return _view_tool(mcp, name, "filter", **kwargs)


def settings_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a settings View."""
    return _view_tool(mcp, name, "settings", **kwargs)


def embed_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns an embed View."""
    return _view_tool(mcp, name, "embed", **kwargs)


def diff_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a diff View."""
    return _view_tool(mcp, name, "diff", **kwargs)


def kanban_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a kanban View."""
    return _view_tool(mcp, name, "kanban", **kwargs)


def audio_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns an audio View."""
    return _view_tool(mcp, name, "audio", **kwargs)


def carousel_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a carousel View."""
    return _view_tool(mcp, name, "carousel", **kwargs)


def heatmap_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a heatmap View."""
    return _view_tool(mcp, name, "heatmap", **kwargs)


def gauge_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a gauge View."""
    return _view_tool(mcp, name, "gauge", **kwargs)


def treemap_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a treemap View."""
    return _view_tool(mcp, name, "treemap", **kwargs)


def sunburst_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a sunburst View."""
    return _view_tool(mcp, name, "sunburst", **kwargs)


def scatter_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a scatter View."""
    return _view_tool(mcp, name, "scatter", **kwargs)


def boxplot_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a boxplot View."""
    return _view_tool(mcp, name, "boxplot", **kwargs)


def pivot_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a pivot View."""
    return _view_tool(mcp, name, "pivot", **kwargs)


def crosstab_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a crosstab View."""
    return _view_tool(mcp, name, "crosstab", **kwargs)


def layers_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a layers View."""
    return _view_tool(mcp, name, "layers", **kwargs)


def timeseries_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a timeseries View."""
    return _view_tool(mcp, name, "timeseries", **kwargs)


def profile_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a profile View."""
    return _view_tool(mcp, name, "profile", **kwargs)


def minimap_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a minimap View."""
    return _view_tool(mcp, name, "minimap", **kwargs)


def gis_legend_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a gis-legend View."""
    return _view_tool(mcp, name, "gis-legend", **kwargs)


def terminal_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a terminal View."""
    return _view_tool(mcp, name, "terminal", **kwargs)


def spectrogram_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a spectrogram View."""
    return _view_tool(mcp, name, "spectrogram", **kwargs)


def annotation_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns an annotation View."""
    return _view_tool(mcp, name, "annotation", **kwargs)


def calendar_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a calendar View."""
    return _view_tool(mcp, name, "calendar", **kwargs)


def flowchart_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a flowchart View."""
    return _view_tool(mcp, name, "flowchart", **kwargs)


def funnel_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a funnel View."""
    return _view_tool(mcp, name, "funnel", **kwargs)


def gantt_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a gantt View."""
    return _view_tool(mcp, name, "gantt", **kwargs)


def geostory_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a geostory View."""
    return _view_tool(mcp, name, "geostory", **kwargs)


def globe_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a globe View."""
    return _view_tool(mcp, name, "globe", **kwargs)


def graph_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a graph View."""
    return _view_tool(mcp, name, "graph", **kwargs)


def investigation_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns an investigation View."""
    return _view_tool(mcp, name, "investigation", **kwargs)


def neural_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a neural View."""
    return _view_tool(mcp, name, "neural", **kwargs)


def notebook_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a notebook View."""
    return _view_tool(mcp, name, "notebook", **kwargs)


def sankey_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a sankey View."""
    return _view_tool(mcp, name, "sankey", **kwargs)


def slides_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a slides View."""
    return _view_tool(mcp, name, "slides", **kwargs)


def swimlane_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a swimlane View."""
    return _view_tool(mcp, name, "swimlane", **kwargs)


def threed_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a 3D View."""
    return _view_tool(mcp, name, "threed", **kwargs)


def font_tool(mcp: Any, name: str, **kwargs: Any) -> Callable[[F], F]:
    """Register an MCP tool that returns a font glyph View."""
    return _view_tool(mcp, name, "font", **kwargs)


def view_tool(mcp: Any, name: str, view_type: str, **kwargs: Any) -> Callable[[F], F]:
    """Generic decorator for any view type."""
    return _view_tool(mcp, name, view_type, **kwargs)
