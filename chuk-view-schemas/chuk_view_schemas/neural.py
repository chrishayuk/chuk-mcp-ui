from typing import List, Literal, Optional

from pydantic import BaseModel


class NeuralLayer(BaseModel):
    name: str
    type: Literal["input", "conv", "pooling", "dense", "dropout", "output"]
    units: int
    activation: Optional[str] = None


class NeuralContent(BaseModel):
    type: Literal["neural"] = "neural"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    layers: List[NeuralLayer]
