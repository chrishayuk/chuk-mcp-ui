from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class RankedItem(BaseModel):
    id: str
    rank: int
    title: str
    score: float
    previous_rank: Optional[int] = Field(None, alias="previousRank")
    subtitle: Optional[str] = None
    badges: Optional[List[str]] = None

    model_config = {"populate_by_name": True}


class RankedContent(BaseModel):
    type: Literal["ranked"] = "ranked"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    max_score: Optional[float] = Field(None, alias="maxScore")
    score_label: Optional[str] = Field(None, alias="scoreLabel")
    show_delta: Optional[bool] = Field(None, alias="showDelta")
    items: List[RankedItem]

    model_config = {"populate_by_name": True}
