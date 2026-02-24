from typing import List, Literal, Optional

from pydantic import BaseModel


class SankeyNode(BaseModel):
    id: str
    label: str
    color: Optional[str] = None


class SankeyLink(BaseModel):
    source: str
    target: str
    value: float
    color: Optional[str] = None


class SankeyContent(BaseModel):
    type: Literal["sankey"] = "sankey"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    nodes: List[SankeyNode]
    links: List[SankeyLink]
