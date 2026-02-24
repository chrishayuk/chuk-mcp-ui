from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class GlobeRotation(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None


class GlobePoint(BaseModel):
    id: str
    lat: float
    lon: float
    label: Optional[str] = None
    color: Optional[str] = None
    size: Optional[float] = None


class GlobeArc(BaseModel):
    source: str = Field(alias="from")
    to: str
    color: Optional[str] = None

    model_config = {"populate_by_name": True}


class GlobeContent(BaseModel):
    type: Literal["globe"] = "globe"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    rotation: Optional[GlobeRotation] = None
    points: List[GlobePoint]
    arcs: Optional[List[GlobeArc]] = None
