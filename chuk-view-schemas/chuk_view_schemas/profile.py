from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ProfilePoint(BaseModel):
    x: float
    y: float


class ProfileContent(BaseModel):
    type: Literal["profile"] = "profile"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    x_label: Optional[str] = Field(None, alias="xLabel")
    y_label: Optional[str] = Field(None, alias="yLabel")
    fill: Optional[bool] = None
    points: List[ProfilePoint]

    model_config = {"populate_by_name": True}
