from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class NotebookCell(BaseModel):
    cell_type: Literal["markdown", "code", "table", "counter"] = Field(alias="cellType")
    source: Optional[str] = None
    language: Optional[str] = None
    output: Optional[str] = None
    columns: Optional[List[str]] = None
    rows: Optional[List[List[str]]] = None
    value: Optional[float] = None
    label: Optional[str] = None

    model_config = {"populate_by_name": True}


class NotebookContent(BaseModel):
    type: Literal["notebook"] = "notebook"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    cells: List[NotebookCell]
