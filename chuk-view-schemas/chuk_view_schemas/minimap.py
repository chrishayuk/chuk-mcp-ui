from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


class MinimapCenter(BaseModel):
    lat: float
    lon: float


class MinimapLayer(BaseModel):
    id: str
    label: str
    features: Dict[str, Any]  # GeoJSON


class MinimapPane(BaseModel):
    center: Optional[MinimapCenter] = None
    zoom: Optional[int] = None
    layers: List[MinimapLayer]


class MinimapContent(BaseModel):
    type: Literal["minimap"] = "minimap"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    overview: MinimapPane
    detail: MinimapPane
