from typing import List, Literal, Optional

from pydantic import BaseModel


class TerminalLine(BaseModel):
    text: str
    type: Optional[Literal["stdin", "stdout", "stderr"]] = None


class TerminalContent(BaseModel):
    type: Literal["terminal"] = "terminal"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    lines: List[TerminalLine]
