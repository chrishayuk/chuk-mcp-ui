from typing import List, Literal, Optional

from pydantic import BaseModel


class StepLocation(BaseModel):
    lat: float
    lon: float


class GeostoryStep(BaseModel):
    id: str
    title: str
    text: str
    location: StepLocation


class GeostoryContent(BaseModel):
    type: Literal["geostory"] = "geostory"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    steps: List[GeostoryStep]
