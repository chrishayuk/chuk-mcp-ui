from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class LogEntry(BaseModel):
    timestamp: Optional[str] = None
    level: Literal["info", "debug", "warning", "error"]
    message: str
    source: Optional[str] = None


class LogContent(BaseModel):
    type: Literal["log"] = "log"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    searchable: Optional[bool] = None
    show_timestamp: Optional[bool] = Field(None, alias="showTimestamp")
    monospace: Optional[bool] = None
    entries: List[LogEntry]

    model_config = {"populate_by_name": True}
