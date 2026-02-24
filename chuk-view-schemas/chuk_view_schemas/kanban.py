from typing import List, Literal, Optional

from pydantic import BaseModel


class KanbanItem(BaseModel):
    id: str
    title: str
    tags: Optional[List[str]] = None
    description: Optional[str] = None


class KanbanColumn(BaseModel):
    id: str
    title: str
    items: List[KanbanItem]


class KanbanContent(BaseModel):
    type: Literal["kanban"] = "kanban"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    columns: List[KanbanColumn]
