from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class DiffLine(BaseModel):
    type: Literal["context", "add", "remove"]
    content: str
    line_a: Optional[int] = Field(None, alias="lineA")
    line_b: Optional[int] = Field(None, alias="lineB")

    model_config = {"populate_by_name": True}


class DiffHunk(BaseModel):
    header_a: Optional[str] = Field(None, alias="headerA")
    lines: List[DiffLine]

    model_config = {"populate_by_name": True}


class DiffContent(BaseModel):
    type: Literal["diff"] = "diff"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    language: Optional[str] = None
    file_a: Optional[str] = Field(None, alias="fileA")
    file_b: Optional[str] = Field(None, alias="fileB")
    hunks: List[DiffHunk]

    model_config = {"populate_by_name": True}
