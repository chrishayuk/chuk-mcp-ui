from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class BoxplotAxisConfig(BaseModel):
    label: Optional[str] = None


class BoxplotStats(BaseModel):
    min: float
    q1: float
    median: float
    q3: float
    max: float
    outliers: Optional[List[float]] = None


class BoxplotGroup(BaseModel):
    label: str
    stats: BoxplotStats


class BoxplotContent(BaseModel):
    type: Literal["boxplot"] = "boxplot"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    y_axis: Optional[BoxplotAxisConfig] = Field(None, alias="yAxis")
    groups: List[BoxplotGroup]

    model_config = {"populate_by_name": True}
