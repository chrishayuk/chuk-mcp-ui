from typing import List, Literal, Optional

from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str
    color: Optional[str] = None
    size: Optional[float] = None
    group: Optional[str] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None
    color: Optional[str] = None
    weight: Optional[float] = None


class GraphContent(BaseModel):
    type: Literal["graph"] = "graph"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    directed: Optional[bool] = None
    nodes: List[GraphNode]
    edges: List[GraphEdge]
