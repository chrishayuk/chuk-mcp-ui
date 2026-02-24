from typing import List, Literal, Optional

from pydantic import BaseModel


class Slide(BaseModel):
    title: Optional[str] = None
    content: str
    layout: Optional[Literal["default", "center", "split"]] = None


class SlidesContent(BaseModel):
    type: Literal["slides"] = "slides"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    transition: Optional[Literal["fade", "slide", "none"]] = None
    slides: List[Slide]
