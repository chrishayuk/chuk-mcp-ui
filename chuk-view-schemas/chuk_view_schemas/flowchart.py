from typing import List, Literal, Optional

from pydantic import BaseModel


class FlowchartNode(BaseModel):
    id: str
    label: str
    shape: Optional[Literal["rect", "diamond", "ellipse", "parallelogram"]] = None
    color: Optional[str] = None


class FlowchartEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None
    style: Optional[Literal["solid", "dashed", "dotted"]] = None


class FlowchartContent(BaseModel):
    type: Literal["flowchart"] = "flowchart"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    direction: Optional[Literal["TB", "BT", "LR", "RL"]] = None
    nodes: List[FlowchartNode]
    edges: List[FlowchartEdge]
