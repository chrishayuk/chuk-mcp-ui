from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class SplitPanel(BaseModel):
    label: Optional[str] = None
    view_url: str = Field(alias="viewUrl")
    structured_content: Any = Field(alias="structuredContent")

    model_config = {"populate_by_name": True}


class SplitContent(BaseModel):
    type: Literal["split"] = "split"
    version: Literal["1.0"] = "1.0"
    direction: Optional[Literal["horizontal", "vertical"]] = None
    ratio: Optional[str] = None
    left: SplitPanel
    right: SplitPanel
