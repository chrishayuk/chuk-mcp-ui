from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class PopupAction(BaseModel):
    label: str
    tool: str
    arguments: Dict[str, str]
    confirm: Optional[str] = None


class PopupTemplate(BaseModel):
    title: str
    body: Optional[str] = None
    fields: Optional[List[str]] = None
    actions: Optional[List[PopupAction]] = None


class LayerStyle(BaseModel):
    color: Optional[str] = None
    weight: Optional[int] = None
    fill_color: Optional[str] = Field(None, alias="fillColor")
    fill_opacity: Optional[float] = Field(None, alias="fillOpacity")
    icon: Optional[str] = None
    radius: Optional[int] = None

    model_config = {"populate_by_name": True}


class ClusterConfig(BaseModel):
    enabled: bool
    radius: Optional[int] = None


class MapLayer(BaseModel):
    id: str
    label: str
    visible: Optional[bool] = None
    opacity: Optional[float] = None
    features: Dict[str, Any]  # GeoJSON FeatureCollection
    style: Optional[LayerStyle] = None
    cluster: Optional[ClusterConfig] = None
    popup: Optional[PopupTemplate] = None


class MapCenter(BaseModel):
    lat: float
    lon: float


class MapBounds(BaseModel):
    south: float
    west: float
    north: float
    east: float


class MapControls(BaseModel):
    zoom: Optional[bool] = None
    layers: Optional[bool] = None
    scale: Optional[bool] = None
    fullscreen: Optional[bool] = None


class MapContent(BaseModel):
    type: Literal["map"] = "map"
    version: Literal["1.0"] = "1.0"
    center: Optional[MapCenter] = None
    zoom: Optional[int] = None
    bounds: Optional[MapBounds] = None
    basemap: Optional[Literal["osm", "satellite", "terrain", "dark"]] = None
    layers: List[MapLayer]
    controls: Optional[MapControls] = None
