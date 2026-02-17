from typing import Literal, Optional

from pydantic import BaseModel


class MarkdownContent(BaseModel):
    type: Literal["markdown"] = "markdown"
    version: Literal["1.0"] = "1.0"
    content: str
    title: Optional[str] = None
