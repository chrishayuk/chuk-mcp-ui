from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class DetailField(BaseModel):
    label: str
    value: str
    type: Optional[Literal["text", "badge"]] = None


class DetailAction(BaseModel):
    label: str
    tool: str
    arguments: Dict[str, Any]


class DetailContent(BaseModel):
    type: Literal["detail"] = "detail"
    version: Literal["1.0"] = "1.0"
    title: str
    subtitle: Optional[str] = None
    fields: List[DetailField]
    actions: Optional[List[DetailAction]] = None
