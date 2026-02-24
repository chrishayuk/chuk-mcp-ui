"""Pydantic v2 schemas for chuk-mcp-ui Views."""

from .infer import infer_view, infer_views, ViewSuggestion
from .chart import ChartContent, ChartDataset, ChartClickAction
from .dashboard import DashboardContent, Panel
from .datatable import DataTableContent, Column, RowAction
from .form import (
    FormContent,
    JSONSchemaField,
    FieldSchema,
    UISchema,
    FieldUI,
    FieldGroup,
)
from .map import MapContent, MapLayer, LayerStyle, PopupTemplate, PopupAction
from .markdown import MarkdownContent
from .pdf import PdfContent
from .split import SplitContent, SplitPanel
from .tabs import TabsContent, Tab
from .video import VideoContent
from .detail import DetailContent, DetailField, DetailAction
from .counter import CounterContent, CounterTrend
from .code import CodeContent
from .status import StatusContent, StatusItem
from .timeline import TimelineContent, TimelineEvent
from .gallery import GalleryContent, GalleryItem
from .kanban import KanbanContent, KanbanColumn, KanbanItem
from .image import ImageContent, ImageItem
from .log import LogContent, LogEntry
from .alert import AlertContent, AlertItem
from .compare import CompareContent, CompareImage, CompareLabels
from .ranked import RankedContent, RankedItem
from .chat import ChatContent, ChatMessage
from .quiz import QuizContent, QuizQuestion, QuizOption
from .poll import PollContent, PollQuestion, PollOption
from .diff import DiffContent, DiffHunk, DiffLine
from .embed import EmbedContent
from .filter import FilterContent, FilterField, FilterOption
from .settings import SettingsContent, SettingsSection, SettingsField, SettingsOption
from .stepper import StepperContent, Step
from .gauge import GaugeContent, GaugeThreshold
from .heatmap import HeatmapContent, HeatmapColorScale
from .crosstab import CrosstabContent
from .scatter import ScatterContent, ScatterDataset, ScatterPoint, ScatterAxisConfig
from .boxplot import BoxplotContent, BoxplotGroup, BoxplotStats
from .timeseries import TimeseriesContent, TimeseriesSeries, TimeseriesDataPoint
from .treemap import TreemapContent, TreemapNode
from .sunburst import SunburstContent, SunburstNode
from .pivot import PivotContent, PivotValue
from .profile import ProfileContent, ProfilePoint
from .audio import AudioContent
from .carousel import CarouselContent, CarouselItem
from .terminal import TerminalContent, TerminalLine
from .gis_legend import GisLegendContent, GisLegendSection, GisLegendItem, GradientStop
from .layers import LayersContent, LayersLayer, LayersCenter
from .minimap import MinimapContent, MinimapPane, MinimapLayer, MinimapCenter
from .spectrogram import SpectrogramContent, SpectrogramData
from .notebook import NotebookContent, NotebookCell
from .funnel import FunnelContent, FunnelStage
from .swimlane import SwimlaneContent, SwimlaneLane, SwimlaneColumn, SwimlaneActivity
from .slides import SlidesContent, Slide
from .annotation import AnnotationContent, AnnotationItem
from .neural import NeuralContent, NeuralLayer
from .sankey import SankeyContent, SankeyNode, SankeyLink
from .geostory import GeostoryContent, GeostoryStep, StepLocation
from .investigation import InvestigationContent, Evidence, Connection
from .gantt import GanttContent, GanttTask
from .calendar_view import CalendarContent, CalendarEvent
from .graph import GraphContent, GraphNode, GraphEdge
from .flowchart import FlowchartContent, FlowchartNode, FlowchartEdge
from .globe import GlobeContent, GlobePoint, GlobeArc, GlobeRotation
from .threed import ThreeDContent, ThreeDObject
from .tree import TreeContent, TreeNode
from .progress import ProgressContent, ProgressTrack, OverallProgress
from .confirm import ConfirmContent
from .json_view import JsonContent

__all__ = [
    "infer_view",
    "infer_views",
    "ViewSuggestion",
    "ChartContent",
    "ChartDataset",
    "ChartClickAction",
    "DashboardContent",
    "Panel",
    "DataTableContent",
    "Column",
    "RowAction",
    "FormContent",
    "JSONSchemaField",
    "FieldSchema",
    "UISchema",
    "FieldUI",
    "FieldGroup",
    "MapContent",
    "MapLayer",
    "LayerStyle",
    "PopupTemplate",
    "PopupAction",
    "MarkdownContent",
    "PdfContent",
    "SplitContent",
    "SplitPanel",
    "TabsContent",
    "Tab",
    "VideoContent",
    "DetailContent",
    "DetailField",
    "DetailAction",
    "CounterContent",
    "CounterTrend",
    "CodeContent",
    "StatusContent",
    "StatusItem",
    "TimelineContent",
    "TimelineEvent",
    "GalleryContent",
    "GalleryItem",
    "KanbanContent",
    "KanbanColumn",
    "KanbanItem",
    "ImageContent",
    "ImageItem",
    "LogContent",
    "LogEntry",
    "AlertContent",
    "AlertItem",
    "CompareContent",
    "CompareImage",
    "CompareLabels",
    "RankedContent",
    "RankedItem",
    "ChatContent",
    "ChatMessage",
    "QuizContent",
    "QuizQuestion",
    "QuizOption",
    "PollContent",
    "PollQuestion",
    "PollOption",
    "DiffContent",
    "DiffHunk",
    "DiffLine",
    "EmbedContent",
    "FilterContent",
    "FilterField",
    "FilterOption",
    "SettingsContent",
    "SettingsSection",
    "SettingsField",
    "SettingsOption",
    "StepperContent",
    "Step",
    "GaugeContent",
    "GaugeThreshold",
    "HeatmapContent",
    "HeatmapColorScale",
    "CrosstabContent",
    "ScatterContent",
    "ScatterDataset",
    "ScatterPoint",
    "ScatterAxisConfig",
    "BoxplotContent",
    "BoxplotGroup",
    "BoxplotStats",
    "TimeseriesContent",
    "TimeseriesSeries",
    "TimeseriesDataPoint",
    "TreemapContent",
    "TreemapNode",
    "SunburstContent",
    "SunburstNode",
    "PivotContent",
    "PivotValue",
    "ProfileContent",
    "ProfilePoint",
    "AudioContent",
    "CarouselContent",
    "CarouselItem",
    "TerminalContent",
    "TerminalLine",
    "GisLegendContent",
    "GisLegendSection",
    "GisLegendItem",
    "GradientStop",
    "LayersContent",
    "LayersLayer",
    "LayersCenter",
    "MinimapContent",
    "MinimapPane",
    "MinimapLayer",
    "MinimapCenter",
    "SpectrogramContent",
    "SpectrogramData",
    "NotebookContent",
    "NotebookCell",
    "FunnelContent",
    "FunnelStage",
    "SwimlaneContent",
    "SwimlaneLane",
    "SwimlaneColumn",
    "SwimlaneActivity",
    "SlidesContent",
    "Slide",
    "AnnotationContent",
    "AnnotationItem",
    "NeuralContent",
    "NeuralLayer",
    "SankeyContent",
    "SankeyNode",
    "SankeyLink",
    "GeostoryContent",
    "GeostoryStep",
    "StepLocation",
    "InvestigationContent",
    "Evidence",
    "Connection",
    "GanttContent",
    "GanttTask",
    "CalendarContent",
    "CalendarEvent",
    "GraphContent",
    "GraphNode",
    "GraphEdge",
    "FlowchartContent",
    "FlowchartNode",
    "FlowchartEdge",
    "GlobeContent",
    "GlobePoint",
    "GlobeArc",
    "GlobeRotation",
    "ThreeDContent",
    "ThreeDObject",
    "TreeContent",
    "TreeNode",
    "ProgressContent",
    "ProgressTrack",
    "OverallProgress",
    "ConfirmContent",
    "JsonContent",
]

# Server-side decorator helpers (optional — requires mcp package)
try:
    from .fastmcp import (  # noqa: F401
        map_tool,
        chart_tool,
        datatable_tool,
        form_tool,
        markdown_tool,
        video_tool,
        pdf_tool,
        dashboard_tool,
        split_tool,
        tabs_tool,
        detail_tool,
        counter_tool,
        code_tool,
        progress_tool,
        confirm_tool,
        json_tool,
        status_tool,
        gallery_tool,
        tree_tool,
        timeline_tool,
        log_tool,
        image_tool,
        compare_tool,
        chat_tool,
        ranked_tool,
        quiz_tool,
        poll_tool,
        alert_tool,
        stepper_tool,
        filter_tool,
        settings_tool,
        embed_tool,
        diff_tool,
        kanban_tool,
        audio_tool,
        carousel_tool,
        heatmap_tool,
        gauge_tool,
        treemap_tool,
        sunburst_tool,
        scatter_tool,
        boxplot_tool,
        pivot_tool,
        crosstab_tool,
        layers_tool,
        timeseries_tool,
        profile_tool,
        minimap_tool,
        gis_legend_tool,
        terminal_tool,
        spectrogram_tool,
        annotation_tool,
        calendar_tool,
        flowchart_tool,
        funnel_tool,
        gantt_tool,
        geostory_tool,
        globe_tool,
        graph_tool,
        investigation_tool,
        neural_tool,
        notebook_tool,
        sankey_tool,
        slides_tool,
        swimlane_tool,
        threed_tool,
        view_tool,
        CDN_BASE,
        VIEW_PATHS,
    )
except ImportError:
    pass
