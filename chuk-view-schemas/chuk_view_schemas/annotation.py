from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class AnnotationItem(BaseModel):
    kind: Literal["circle", "rect", "arrow", "text"]
    id: Optional[str] = None
    label: Optional[str] = None
    color: Optional[str] = None
    cx: Optional[float] = None
    cy: Optional[float] = None
    r: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    x1: Optional[float] = None
    y1: Optional[float] = None
    x2: Optional[float] = None
    y2: Optional[float] = None
    text: Optional[str] = None
    font_size: Optional[int] = Field(None, alias="fontSize")

    model_config = {"populate_by_name": True}


class AnnotationContent(BaseModel):
    type: Literal["annotation"] = "annotation"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    image_url: str = Field(alias="imageUrl")
    image_width: Optional[int] = Field(None, alias="imageWidth")
    image_height: Optional[int] = Field(None, alias="imageHeight")
    annotations: List[AnnotationItem]

    model_config = {"populate_by_name": True}
