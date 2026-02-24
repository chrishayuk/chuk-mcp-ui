from typing import Literal, Optional

from pydantic import BaseModel, Field


class CompareImage(BaseModel):
    url: str
    alt: Optional[str] = None


class CompareLabels(BaseModel):
    before: Optional[str] = None
    after: Optional[str] = None


class CompareContent(BaseModel):
    type: Literal["compare"] = "compare"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    before: CompareImage
    after: CompareImage
    labels: Optional[CompareLabels] = None
    initial_position: Optional[int] = Field(None, alias="initialPosition", ge=0, le=100)

    model_config = {"populate_by_name": True}
