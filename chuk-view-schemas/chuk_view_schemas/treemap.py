from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel


class TreemapNode(BaseModel):
    id: str
    label: str
    value: Optional[float] = None
    color: Optional[str] = None
    children: Optional[List[TreemapNode]] = None


class TreemapContent(BaseModel):
    type: Literal["treemap"] = "treemap"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    root: TreemapNode
