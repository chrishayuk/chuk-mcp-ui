from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field


class Tab(BaseModel):
    id: str
    label: str
    icon: Optional[str] = None
    view_url: str = Field(alias="viewUrl")
    structured_content: Any = Field(alias="structuredContent")

    model_config = {"populate_by_name": True}


class TabsContent(BaseModel):
    type: Literal["tabs"] = "tabs"
    version: Literal["1.0"] = "1.0"
    active_tab: Optional[str] = Field(None, alias="activeTab")
    tabs: List[Tab]

    model_config = {"populate_by_name": True}
