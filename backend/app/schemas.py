from __future__ import annotations

from pydantic import BaseModel, Field


class VectorDistanceRequest(BaseModel):
    a: list[float] = Field(min_length=1)
    b: list[float] = Field(min_length=1)


class VectorDistanceResponse(BaseModel):
    distance: float


class ImagePoint(BaseModel):
    id: str
    title: str
    imageUrl: str
    clusterId: str
    coordinates: tuple[float, float, float]


class CoordinateManifest(BaseModel):
    model: str
    reducer: str
    points: list[ImagePoint]
