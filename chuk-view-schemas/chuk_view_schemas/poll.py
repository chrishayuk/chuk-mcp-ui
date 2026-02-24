from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class PollOption(BaseModel):
    id: str
    label: str
    votes: Optional[int] = None


class PollQuestion(BaseModel):
    id: str
    type: Literal["single", "multiple"]
    prompt: str
    max_selections: Optional[int] = Field(None, alias="maxSelections")
    options: List[PollOption]

    model_config = {"populate_by_name": True}


class PollContent(BaseModel):
    type: Literal["poll"] = "poll"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    description: Optional[str] = None
    vote_tool: Optional[str] = Field(None, alias="voteTool")
    questions: List[PollQuestion]

    model_config = {"populate_by_name": True}
