from typing import Literal, Optional, Union

from pydantic import BaseModel, Field


class CounterTrend(BaseModel):
    direction: Literal["up", "down", "flat"]
    value: float
    label: Optional[str] = None


class CounterContent(BaseModel):
    type: Literal["counter"] = "counter"
    version: Literal["1.0"] = "1.0"
    label: str
    value: Union[float, int]
    prefix: Optional[str] = None
    suffix: Optional[str] = None
    trend: Optional[CounterTrend] = None
