from typing import Literal, Optional

from pydantic import BaseModel


class AudioContent(BaseModel):
    type: Literal["audio"] = "audio"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    url: str
    autoplay: Optional[bool] = None
    loop: Optional[bool] = None
