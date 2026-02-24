from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class QuizOption(BaseModel):
    id: str
    label: str


class QuizQuestion(BaseModel):
    id: str
    type: Literal["single", "multiple"]
    prompt: str
    points: Optional[int] = None
    options: List[QuizOption]
    explanation: Optional[str] = None


class QuizContent(BaseModel):
    type: Literal["quiz"] = "quiz"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    description: Optional[str] = None
    validate_tool: Optional[str] = Field(None, alias="validateTool")
    questions: List[QuizQuestion]

    model_config = {"populate_by_name": True}
