from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class CodeContent(BaseModel):
    type: Literal["code"] = "code"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    language: Optional[str] = None
    code: str
    show_line_numbers: Optional[bool] = Field(None, alias="showLineNumbers")
    highlight_lines: Optional[List[int]] = Field(None, alias="highlightLines")

    model_config = {"populate_by_name": True}
