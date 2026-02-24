from typing import List, Literal, Optional

from pydantic import BaseModel


class CarouselItem(BaseModel):
    id: Optional[str] = None
    image: str
    title: Optional[str] = None
    description: Optional[str] = None


class CarouselContent(BaseModel):
    type: Literal["carousel"] = "carousel"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    items: List[CarouselItem]
