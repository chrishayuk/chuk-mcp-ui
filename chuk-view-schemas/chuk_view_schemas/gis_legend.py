from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class GradientStop(BaseModel):
    color: str
    label: str


class GisLegendItem(BaseModel):
    type: Literal["point", "line", "polygon", "gradient"]
    label: str
    color: Optional[str] = None
    fill_color: Optional[str] = Field(None, alias="fillColor")
    stroke_color: Optional[str] = Field(None, alias="strokeColor")
    gradient_stops: Optional[List[GradientStop]] = Field(None, alias="gradientStops")

    model_config = {"populate_by_name": True}


class GisLegendSection(BaseModel):
    title: str
    items: List[GisLegendItem]


class GisLegendContent(BaseModel):
    type: Literal["gis-legend"] = "gis-legend"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    sections: List[GisLegendSection]
