from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class Step(BaseModel):
    id: str
    label: str
    status: Literal["pending", "active", "complete", "error"]
    description: Optional[str] = None
    detail: Optional[str] = None


class StepperContent(BaseModel):
    type: Literal["stepper"] = "stepper"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    active_step: Optional[str] = Field(None, alias="activeStep")
    steps: List[Step]

    model_config = {"populate_by_name": True}
