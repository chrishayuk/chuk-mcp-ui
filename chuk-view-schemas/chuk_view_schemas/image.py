from typing import List, Literal, Optional

from pydantic import BaseModel


class ImageItem(BaseModel):
    id: Optional[str] = None
    url: str
    alt: Optional[str] = None
    caption: Optional[str] = None


class ImageContent(BaseModel):
    type: Literal["image"] = "image"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    images: List[ImageItem]
