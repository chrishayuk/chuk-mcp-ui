from typing import Literal, Optional

from pydantic import BaseModel, Field


class EmbedContent(BaseModel):
    type: Literal["embed"] = "embed"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    url: str
    aspect_ratio: Optional[str] = Field(None, alias="aspectRatio")
    fallback_text: Optional[str] = Field(None, alias="fallbackText")

    model_config = {"populate_by_name": True}
