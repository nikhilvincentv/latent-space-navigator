from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Literal

import numpy as np
from PIL import Image

ReductionMethod = Literal["umap", "tsne", "pca"]


@dataclass(frozen=True)
class ImageEmbedding:
    image_path: Path
    embedding: np.ndarray


def iter_images(image_dir: Path) -> list[Path]:
    extensions = {".jpg", ".jpeg", ".png", ".webp"}
    return sorted(path for path in image_dir.rglob("*") if path.suffix.lower() in extensions)


def deterministic_image_embedding(image_path: Path, dimensions: int = 512) -> np.ndarray:
    """Small offline embedding used by tests and demos when CLIP is unavailable."""
    digest = hashlib.sha256(image_path.read_bytes()).digest()
    values = np.frombuffer((digest * ((dimensions // len(digest)) + 1))[:dimensions], dtype=np.uint8)
    normalized = values.astype(np.float32) / 255.0
    return normalized / np.linalg.norm(normalized)


def clip_image_embeddings(image_paths: Iterable[Path], model_name: str = "ViT-B-32") -> list[ImageEmbedding]:
    import open_clip
    import torch

    model, _, preprocess = open_clip.create_model_and_transforms(model_name, pretrained="openai")
    model.eval()

    embeddings: list[ImageEmbedding] = []
    with torch.no_grad():
        for image_path in image_paths:
            image = preprocess(Image.open(image_path).convert("RGB")).unsqueeze(0)
            embedding = model.encode_image(image)
            embedding = embedding / embedding.norm(dim=-1, keepdim=True)
            embeddings.append(ImageEmbedding(image_path=image_path, embedding=embedding.squeeze(0).cpu().numpy()))

    return embeddings


def reduce_embeddings(embeddings: np.ndarray, method: ReductionMethod = "umap") -> np.ndarray:
    if embeddings.ndim != 2:
        raise ValueError("Expected a 2D embedding matrix.")
    if embeddings.shape[0] < 2:
        raise ValueError("At least two images are required for dimensionality reduction.")

    if method == "umap":
        import umap

        reducer = umap.UMAP(n_components=3, n_neighbors=min(15, embeddings.shape[0] - 1), random_state=42)
        return reducer.fit_transform(embeddings)

    if method == "tsne":
        from sklearn.manifold import TSNE

        perplexity = max(1, min(30, embeddings.shape[0] - 1))
        return TSNE(n_components=3, perplexity=perplexity, init="random", random_state=42).fit_transform(embeddings)

    from sklearn.decomposition import PCA

    return PCA(n_components=3, random_state=42).fit_transform(embeddings)


def normalize_coordinates(coordinates: np.ndarray, scale: float = 8.0) -> np.ndarray:
    centered = coordinates - coordinates.mean(axis=0)
    max_abs = np.abs(centered).max()
    if max_abs == 0:
        return centered
    return centered / max_abs * scale
