from typing import List, Literal, Optional

from pydantic import BaseModel


class AlertItem(BaseModel):
    id: Optional[str] = None
    severity: Literal["error", "warning", "info", "success"]
    title: str
    message: Optional[str] = None
    source: Optional[str] = None
    timestamp: Optional[str] = None


class AlertContent(BaseModel):
    type: Literal["alert"] = "alert"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    dismissible: Optional[bool] = None
    alerts: List[AlertItem]
