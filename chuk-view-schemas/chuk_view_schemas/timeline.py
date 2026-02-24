from typing import List, Literal, Optional

from pydantic import BaseModel


class TimelineEvent(BaseModel):
    date: str
    title: str
    description: Optional[str] = None


class TimelineContent(BaseModel):
    type: Literal["timeline"] = "timeline"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    events: List[TimelineEvent]
