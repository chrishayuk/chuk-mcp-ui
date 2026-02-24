from typing import List, Literal, Optional

from pydantic import BaseModel


class GalleryItem(BaseModel):
    src: str
    title: Optional[str] = None
    caption: Optional[str] = None
    alt: Optional[str] = None


class GalleryContent(BaseModel):
    type: Literal["gallery"] = "gallery"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    items: List[GalleryItem]
