from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


class LabeledValue(BaseModel):
    label: str
    value: float


class XYPoint(BaseModel):
    x: Union[float, str]
    y: float


class BubblePoint(BaseModel):
    x: float
    y: float
    r: float


class ChartDataset(BaseModel):
    label: str
    values: List[Any]  # number | LabeledValue | XYPoint | BubblePoint
    color: Optional[str] = None
    background_color: Optional[str] = Field(None, alias="backgroundColor")
    fill: Optional[bool] = None
    type: Optional[str] = None
    border_width: Optional[int] = Field(None, alias="borderWidth")
    tension: Optional[float] = None

    model_config = {"populate_by_name": True}


class AxisConfig(BaseModel):
    label: Optional[str] = None
    type: Optional[Literal["linear", "logarithmic", "category", "time"]] = None
    min: Optional[float] = None
    max: Optional[float] = None
    stacked: Optional[bool] = None


class LegendConfig(BaseModel):
    position: Optional[Literal["top", "bottom", "left", "right", "none"]] = None


class Annotation(BaseModel):
    type: Optional[Literal["line", "label"]] = None
    axis: Optional[Literal["x", "y"]] = None
    value: Optional[Any] = None
    label: Optional[str] = None
    color: Optional[str] = None


ChartType = Literal[
    "bar", "line", "scatter", "pie", "doughnut", "area", "radar", "bubble"
]


class ChartContent(BaseModel):
    type: Literal["chart"] = "chart"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    subtitle: Optional[str] = None
    chart_type: ChartType = Field(alias="chartType")
    data: List[ChartDataset]
    x_axis: Optional[AxisConfig] = Field(None, alias="xAxis")
    y_axis: Optional[AxisConfig] = Field(None, alias="yAxis")
    legend: Optional[LegendConfig] = None
    annotations: Optional[List[Annotation]] = None
    interactive: Optional[bool] = None

    model_config = {"populate_by_name": True}
