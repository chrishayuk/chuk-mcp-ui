from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class CrosstabContent(BaseModel):
    type: Literal["crosstab"] = "crosstab"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    row_headers: List[str] = Field(alias="rowHeaders")
    column_headers: List[str] = Field(alias="columnHeaders")
    values: List[List[float]]
    show_totals: Optional[bool] = Field(None, alias="showTotals")

    model_config = {"populate_by_name": True}
