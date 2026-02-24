from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class JsonContent(BaseModel):
    type: Literal["json"] = "json"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    data: Any
    expand_depth: Optional[int] = Field(None, alias="expandDepth")
    searchable: Optional[bool] = None

    model_config = {"populate_by_name": True}
