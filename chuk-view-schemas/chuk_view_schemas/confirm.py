from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


class ConfirmContent(BaseModel):
    type: Literal["confirm"] = "confirm"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    message: str
    severity: Optional[Literal["info", "warning", "danger"]] = None
    details: Optional[str] = None
    confirm_label: Optional[str] = Field(None, alias="confirmLabel")
    cancel_label: Optional[str] = Field(None, alias="cancelLabel")
    confirm_tool: Optional[str] = Field(None, alias="confirmTool")
    confirm_args: Optional[Dict[str, Any]] = Field(None, alias="confirmArgs")

    model_config = {"populate_by_name": True}
