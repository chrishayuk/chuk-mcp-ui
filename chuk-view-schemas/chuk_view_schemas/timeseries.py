from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class TimeseriesAxisLabel(BaseModel):
    label: Optional[str] = None


class TimeseriesYAxis(BaseModel):
    label: Optional[str] = None
    min: Optional[float] = None
    max: Optional[float] = None


class TimeseriesDataPoint(BaseModel):
    t: str
    v: float


class TimeseriesSeries(BaseModel):
    label: str
    color: Optional[str] = None
    data: List[TimeseriesDataPoint]


class TimeseriesContent(BaseModel):
    type: Literal["timeseries"] = "timeseries"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    x_axis: Optional[TimeseriesAxisLabel] = Field(None, alias="xAxis")
    y_axis: Optional[TimeseriesYAxis] = Field(None, alias="yAxis")
    series: List[TimeseriesSeries]

    model_config = {"populate_by_name": True}
