from typing import List, Literal, Optional

from pydantic import BaseModel


class GaugeThreshold(BaseModel):
    value: float
    color: str


class GaugeContent(BaseModel):
    type: Literal["gauge"] = "gauge"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    value: float
    min: Optional[float] = 0
    max: Optional[float] = 100
    unit: Optional[str] = None
    thresholds: Optional[List[GaugeThreshold]] = None
