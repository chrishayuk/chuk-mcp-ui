from typing import Literal, Optional

from pydantic import BaseModel, Field


class PdfContent(BaseModel):
    type: Literal["pdf"] = "pdf"
    version: Literal["1.0"] = "1.0"
    url: str
    initial_page: Optional[int] = Field(None, alias="initialPage", ge=1)
    title: Optional[str] = None

    model_config = {"populate_by_name": True}
