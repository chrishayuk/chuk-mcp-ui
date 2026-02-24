from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class PivotValue(BaseModel):
    field: str
    aggregate: Literal["sum", "avg", "count", "min", "max"]
    label: Optional[str] = None


class PivotContent(BaseModel):
    type: Literal["pivot"] = "pivot"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    data: List[Dict]
    rows: List[str]
    columns: List[str]
    values: List[PivotValue]
    show_totals: Optional[bool] = Field(None, alias="showTotals")

    model_config = {"populate_by_name": True}
