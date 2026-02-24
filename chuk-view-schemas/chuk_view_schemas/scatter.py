from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ScatterAxisConfig(BaseModel):
    label: Optional[str] = None
    min: Optional[float] = None
    max: Optional[float] = None


class ScatterPoint(BaseModel):
    x: float
    y: float
    label: Optional[str] = None


class ScatterDataset(BaseModel):
    label: str
    color: Optional[str] = None
    points: List[ScatterPoint]


class ScatterContent(BaseModel):
    type: Literal["scatter"] = "scatter"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    x_axis: Optional[ScatterAxisConfig] = Field(None, alias="xAxis")
    y_axis: Optional[ScatterAxisConfig] = Field(None, alias="yAxis")
    datasets: List[ScatterDataset]

    model_config = {"populate_by_name": True}
