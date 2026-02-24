from typing import List, Literal, Optional

from pydantic import BaseModel


class ThreeDObject(BaseModel):
    id: str
    geometry: Literal["box", "sphere", "cylinder", "cone", "torus"]
    position: Optional[List[float]] = None
    scale: Optional[List[float]] = None
    color: Optional[str] = None
    label: Optional[str] = None


class ThreeDContent(BaseModel):
    type: Literal["threed"] = "threed"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    background: Optional[str] = None
    objects: List[ThreeDObject]
