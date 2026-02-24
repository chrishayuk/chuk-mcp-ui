from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field


class SettingsOption(BaseModel):
    value: str
    label: str


class SettingsField(BaseModel):
    id: str
    label: str
    type: Literal["text", "number", "select", "toggle", "range"]
    value: Optional[Any] = None
    description: Optional[str] = None
    options: Optional[List[SettingsOption]] = None
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None


class SettingsSection(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    collapsible: Optional[bool] = None
    collapsed: Optional[bool] = None
    fields: List[SettingsField]


class SettingsContent(BaseModel):
    type: Literal["settings"] = "settings"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    save_tool: Optional[str] = Field(None, alias="saveTool")
    sections: List[SettingsSection]

    model_config = {"populate_by_name": True}
