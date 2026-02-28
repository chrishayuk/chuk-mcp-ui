from typing import List, Literal, Optional

from pydantic import BaseModel


class FontContour(BaseModel):
    """A single closed contour as an SVG path `d` string in font coordinates.

    Font coordinate system: origin at baseline, y increases upward.
    The React component applies ``translate(0, ascender) scale(1, -1)`` to flip
    into screen space before rendering.
    """

    d: str


class FontGlyph(BaseModel):
    """One glyph with its outlines and typographic metrics."""

    name: str
    contours: List[FontContour]
    advance_width: int

    # Typographic metrics (font units)
    upm: int = 1000
    ascender: int = 800
    descender: int = -200
    cap_height: int = 700
    x_height: int = 532

    # Optional axis params for display labels
    sqar: Optional[float] = None
    trap: Optional[float] = None
    weight: Optional[float] = None


class FontContent(BaseModel):
    """Font glyph view — renders one or more glyphs with typographic guide lines."""

    type: Literal["font"] = "font"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    glyphs: List[FontGlyph]
    show_metrics: bool = True
