from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class Column(BaseModel):
    key: str
    label: str
    type: Optional[Literal["text", "number", "date", "boolean", "link", "badge"]] = None
    sortable: Optional[bool] = None
    filterable: Optional[bool] = None
    width: Optional[str] = None
    align: Optional[Literal["left", "center", "right"]] = None
    format: Optional[str] = None
    badge_colors: Optional[Dict[str, str]] = Field(None, alias="badgeColors")

    model_config = {"populate_by_name": True}


class RowAction(BaseModel):
    label: str
    icon: Optional[str] = None
    tool: str
    arguments: Dict[str, str]
    confirm: Optional[str] = None


class DataTableContent(BaseModel):
    type: Literal["datatable"] = "datatable"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    columns: List[Column]
    rows: List[Dict[str, Any]]
    sortable: Optional[bool] = None
    filterable: Optional[bool] = None
    exportable: Optional[bool] = None
    actions: Optional[List[RowAction]] = None
