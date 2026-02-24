from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class HeatmapColorScale(BaseModel):
    min: str
    max: str


class HeatmapContent(BaseModel):
    type: Literal["heatmap"] = "heatmap"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    rows: List[str]
    columns: List[str]
    values: List[List[float]]
    color_scale: Optional[HeatmapColorScale] = Field(None, alias="colorScale")

    model_config = {"populate_by_name": True}
