from typing import Literal, Optional

from pydantic import BaseModel, Field


class VideoContent(BaseModel):
    type: Literal["video"] = "video"
    version: Literal["1.0"] = "1.0"
    url: str
    title: Optional[str] = None
    autoplay: bool = False
    muted: bool = False
    loop: bool = False
    poster: Optional[str] = None
    start_time: Optional[float] = Field(None, alias="startTime", ge=0)

    model_config = {"populate_by_name": True}
