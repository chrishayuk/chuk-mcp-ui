from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel


class SunburstNode(BaseModel):
    id: str
    label: str
    value: Optional[float] = None
    color: Optional[str] = None
    children: Optional[List[SunburstNode]] = None


class SunburstContent(BaseModel):
    type: Literal["sunburst"] = "sunburst"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    root: SunburstNode
