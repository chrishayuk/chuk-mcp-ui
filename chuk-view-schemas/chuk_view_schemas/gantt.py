from typing import List, Literal, Optional

from pydantic import BaseModel


class GanttTask(BaseModel):
    id: str
    label: str
    start: str
    end: str
    progress: Optional[int] = None
    dependencies: Optional[List[str]] = None
    group: Optional[str] = None


class GanttContent(BaseModel):
    type: Literal["gantt"] = "gantt"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    tasks: List[GanttTask]
