from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field


class FilterOption(BaseModel):
    value: str
    label: str


class FilterField(BaseModel):
    id: str
    label: str
    type: Literal["text", "select", "multi-select", "range", "date", "toggle"]
    placeholder: Optional[str] = None
    options: Optional[List[FilterOption]] = None
    min: Optional[float] = None
    max: Optional[float] = None
    default_value: Optional[Any] = Field(None, alias="defaultValue")

    model_config = {"populate_by_name": True}


class FilterContent(BaseModel):
    type: Literal["filter"] = "filter"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    layout: Optional[Literal["vertical", "horizontal"]] = None
    submit_mode: Optional[Literal["auto", "manual"]] = Field(None, alias="submitMode")
    filters: List[FilterField]

    model_config = {"populate_by_name": True}
