from typing import List, Literal, Optional

from pydantic import BaseModel


class StatusItem(BaseModel):
    label: str
    status: Literal["ok", "warning", "error", "unknown"]
    message: Optional[str] = None


class StatusContent(BaseModel):
    type: Literal["status"] = "status"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    items: List[StatusItem]
