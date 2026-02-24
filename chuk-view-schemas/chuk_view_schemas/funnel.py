from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class FunnelStage(BaseModel):
    label: str
    value: float


class FunnelContent(BaseModel):
    type: Literal["funnel"] = "funnel"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    show_conversion: Optional[bool] = Field(None, alias="showConversion")
    stages: List[FunnelStage]

    model_config = {"populate_by_name": True}
