"""Pydantic v2 schemas for chuk-mcp-ui Views."""

from .infer import infer_view, infer_views, ViewSuggestion
from .chart import ChartContent, ChartDataset
from .dashboard import DashboardContent, Panel
from .datatable import DataTableContent, Column, RowAction
from .form import FormContent, JSONSchemaField, FieldSchema, UISchema, FieldUI, FieldGroup
from .map import MapContent, MapLayer, LayerStyle, PopupTemplate, PopupAction
from .markdown import MarkdownContent
from .pdf import PdfContent
from .split import SplitContent, SplitPanel
from .tabs import TabsContent, Tab
from .video import VideoContent

__all__ = [
    "infer_view", "infer_views", "ViewSuggestion",
    "ChartContent", "ChartDataset",
    "DashboardContent", "Panel",
    "DataTableContent", "Column", "RowAction",
    "FormContent", "JSONSchemaField", "FieldSchema", "UISchema", "FieldUI", "FieldGroup",
    "MapContent", "MapLayer", "LayerStyle", "PopupTemplate", "PopupAction",
    "MarkdownContent",
    "PdfContent",
    "SplitContent", "SplitPanel",
    "TabsContent", "Tab",
    "VideoContent",
]

# Server-side decorator helpers (optional — requires mcp package)
try:
    from .fastmcp import (
        map_tool, chart_tool, datatable_tool, form_tool,
        markdown_tool, video_tool, pdf_tool,
        dashboard_tool, split_tool, tabs_tool,
        detail_tool, counter_tool, code_tool,
        progress_tool, confirm_tool, json_tool, status_tool,
        view_tool, CDN_BASE, VIEW_PATHS,
    )
except ImportError:
    pass
