from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import VectorDistanceRequest, VectorDistanceResponse
from app.vector_math import euclidean_distance

app = FastAPI(title="Latent Space Navigator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/distance", response_model=VectorDistanceResponse)
def distance(request: VectorDistanceRequest) -> VectorDistanceResponse:
    return VectorDistanceResponse(distance=euclidean_distance(request.a, request.b))
