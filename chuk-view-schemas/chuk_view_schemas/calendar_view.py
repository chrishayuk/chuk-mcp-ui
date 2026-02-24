from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class CalendarEvent(BaseModel):
    id: str
    title: str
    start: str
    end: Optional[str] = None
    all_day: Optional[bool] = Field(None, alias="allDay")
    color: Optional[str] = None
    description: Optional[str] = None

    model_config = {"populate_by_name": True}


class CalendarContent(BaseModel):
    type: Literal["calendar"] = "calendar"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    default_date: Optional[str] = Field(None, alias="defaultDate")
    events: List[CalendarEvent]

    model_config = {"populate_by_name": True}
