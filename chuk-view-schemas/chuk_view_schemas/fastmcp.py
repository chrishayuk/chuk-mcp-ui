"""
FastMCP decorators for chuk View tools.

Usage:
    from chuk_view_schemas.fastmcp import map_tool, chart_tool, view_tool

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

# CDN URL registry
CDN_BASE = "https://mcp-views.chukai.io"

VIEW_PATHS: dict[str, str] = {
    # Core views (Phase 1-3)
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
    "gallery": "/gallery/v1",
    "tree": "/tree/v1",
    "timeline": "/timeline/v1",
    "log": "/log/v1",
    "image": "/image/v1",
    "compare": "/compare/v1",
    "chat": "/chat/v1",
    "ranked": "/ranked/v1",
    "quiz": "/quiz/v1",
    "poll": "/poll/v1",
    # Developer & interactive views (Phase 3)
    "alert": "/alert/v1",
    "stepper": "/stepper/v1",
    "filter": "/filter/v1",
    "settings": "/settings/v1",
    "embed": "/embed/v1",
    "diff": "/diff/v1",
    "kanban": "/kanban/v1",
    # Media & specialist views (Phase 4)
    "audio": "/audio/v1",
    "carousel": "/carousel/v1",
    "heatmap": "/heatmap/v1",
    "gauge": "/gauge/v1",
    "treemap": "/treemap/v1",
    "sunburst": "/sunburst/v1",
    "scatter": "/scatter/v1",
    "boxplot": "/boxplot/v1",
    "pivot": "/pivot/v1",
    "crosstab": "/crosstab/v1",
    "layers": "/layers/v1",
    "timeseries": "/timeseries/v1",
    "profile": "/profile/v1",
    "minimap": "/minimap/v1",
    "gis-legend": "/gis-legend/v1",
    "terminal": "/terminal/v1",
    "spectrogram": "/spectrogram/v1",
    # Compound views (Phase 6)
    "annotation": "/annotation/v1",
    "calendar": "/calendar/v1",
    "flowchart": "/flowchart/v1",
    "funnel": "/funnel/v1",
    "gantt": "/gantt/v1",
    "geostory": "/geostory/v1",
    "globe": "/globe/v1",
    "graph": "/graph/v1",
    "investigation": "/investigation/v1",
    "neural": "/neural/v1",
    "notebook": "/notebook/v1",
    "sankey": "/sankey/v1",
    "slides": "/slides/v1",
    "swimlane": "/swimlane/v1",
    "threed": "/threed/v1",
}


def _get_cdn_url(view_type: str) -> str:
    path = VIEW_PATHS.get(view_type, f"/{view_type}/v1")
    return f"{CDN_BASE}{path}"


# Text fallback generators
def _map_fallback(data: MapContent) -> str:
    n = sum(
        len(layer.features.get("features", []))
        if isinstance(layer.features, dict)
        else 0
        for layer in data.layers
    )
    names = ", ".join(layer.label for layer in data.layers)
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
    view_type = (
        getattr(data, "type", "unknown") if isinstance(data, BaseModel) else "unknown"
    )
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
    permissions: Optional[dict[str, Any]] = None,
    csp: Optional[dict[str, Any]] = None,
    visibility: Optional[list[str]] = None,
    prefers_border: Optional[bool] = None,
    cdn_base: Optional[str] = None,
) -> Callable[[F], F]:
    """Core decorator factory."""
    effective_cdn = cdn_base or CDN_BASE
    view_path = VIEW_PATHS.get(view_type, f"/{view_type}/v1")
    view_url = f"{effective_cdn}{view_path}"

    # Use ui:// scheme for resourceUri; actual URL goes in viewUrl
    server_name = (
        getattr(getattr(mcp_server, "protocol", None), "server_info", None)
        and mcp_server.protocol.server_info.name
    ) or getattr(mcp_server, "name", "mcp-server")
    resource_uri = f"ui://{server_name}/{view_type}"

    ui_meta: dict[str, Any] = {"resourceUri": resource_uri, "viewUrl": view_url}
    if permissions is not None:
        ui_meta["permissions"] = permissions
    if csp is not None:
        ui_meta["csp"] = csp
    if visibility is not None:
        ui_meta["visibility"] = visibility
    if prefers_border is not None:
        ui_meta["prefersBorder"] = prefers_border

    meta = {"ui": ui_meta}

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
                structured = result.model_dump(by_alias=True, exclude_none=True)
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


def view_tool(mcp: Any, name: str, view_type: str, **kwargs: Any) -> Callable[[F], F]:
    """Generic decorator for any view type."""
    return _view_tool(mcp, name, view_type, **kwargs)
