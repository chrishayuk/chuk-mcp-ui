from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class Evidence(BaseModel):
    id: str
    label: str
    type: Literal["event", "document", "person", "location", "object"]
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class Connection(BaseModel):
    source: str = Field(alias="from")
    to: str
    label: Optional[str] = None
    strength: Optional[Literal["strong", "medium", "weak"]] = None

    model_config = {"populate_by_name": True}


class InvestigationContent(BaseModel):
    type: Literal["investigation"] = "investigation"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    notes: Optional[str] = None
    evidence: List[Evidence]
    connections: List[Connection]
