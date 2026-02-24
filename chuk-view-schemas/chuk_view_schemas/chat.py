from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None


class ChatContent(BaseModel):
    type: Literal["chat"] = "chat"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    respond_tool: Optional[str] = Field(None, alias="respondTool")
    placeholder: Optional[str] = None
    suggestions: Optional[List[str]] = None
    messages: List[ChatMessage]

    model_config = {"populate_by_name": True}
