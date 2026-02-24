from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


class LayersCenter(BaseModel):
    lat: float
    lon: float


class LayersLayer(BaseModel):
    id: str
    label: str
    visible: Optional[bool] = None
    opacity: Optional[float] = None
    features: Dict[str, Any]  # GeoJSON


class LayersContent(BaseModel):
    type: Literal["layers"] = "layers"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    center: Optional[LayersCenter] = None
    zoom: Optional[int] = None
    layers: List[LayersLayer]
