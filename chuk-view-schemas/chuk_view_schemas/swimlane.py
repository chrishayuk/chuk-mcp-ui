from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class SwimlaneLane(BaseModel):
    id: str
    label: str
    color: Optional[str] = None


class SwimlaneColumn(BaseModel):
    id: str
    label: str


class SwimlaneActivity(BaseModel):
    id: str
    lane_id: str = Field(alias="laneId")
    column_id: str = Field(alias="columnId")
    label: str
    status: Optional[Literal["pending", "active", "completed"]] = None

    model_config = {"populate_by_name": True}


class SwimlaneContent(BaseModel):
    type: Literal["swimlane"] = "swimlane"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    lanes: List[SwimlaneLane]
    columns: List[SwimlaneColumn]
    activities: List[SwimlaneActivity]
