from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class Panel(BaseModel):
    id: str
    label: Optional[str] = None
    view_url: str = Field(alias="viewUrl")
    structured_content: Any = Field(alias="structuredContent")
    width: Optional[str] = None
    height: Optional[str] = None
    min_width: Optional[str] = Field(None, alias="minWidth")
    min_height: Optional[str] = Field(None, alias="minHeight")

    model_config = {"populate_by_name": True}


class DashboardContent(BaseModel):
    type: Literal["dashboard"] = "dashboard"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    layout: Literal["split-horizontal", "split-vertical", "grid"]
    panels: List[Panel]
    gap: Optional[str] = None
