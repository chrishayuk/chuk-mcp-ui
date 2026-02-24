from typing import List, Literal, Optional

from pydantic import BaseModel


class TreeNode(BaseModel):
    id: str
    label: str
    icon: Optional[str] = None
    children: Optional[List["TreeNode"]] = None


class TreeContent(BaseModel):
    type: Literal["tree"] = "tree"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    nodes: List[TreeNode]
