"""Pydantic v2 schemas for chuk-mcp-ui Views."""

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
