from typing import List, Literal, Optional

from pydantic import BaseModel


class OverallProgress(BaseModel):
    value: float
    max: Optional[float] = None
    label: Optional[str] = None


class ProgressTrack(BaseModel):
    id: str
    label: str
    value: float
    max: Optional[float] = None
    status: Optional[Literal["pending", "active", "complete", "error"]] = None
    detail: Optional[str] = None


class ProgressContent(BaseModel):
    type: Literal["progress"] = "progress"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    overall: Optional[OverallProgress] = None
    tracks: List[ProgressTrack]
