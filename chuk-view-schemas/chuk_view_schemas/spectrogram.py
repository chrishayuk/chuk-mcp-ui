from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class SpectrogramData(BaseModel):
    sample_rate: int = Field(alias="sampleRate")
    fft_size: int = Field(alias="fftSize")
    hop_size: int = Field(alias="hopSize")
    magnitudes: List[List[float]]

    model_config = {"populate_by_name": True}


class SpectrogramContent(BaseModel):
    type: Literal["spectrogram"] = "spectrogram"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    data: SpectrogramData
