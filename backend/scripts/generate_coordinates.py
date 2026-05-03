from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from app.embedding_pipeline import (
    clip_image_embeddings,
    deterministic_image_embedding,
    iter_images,
    normalize_coordinates,
    reduce_embeddings,
)
from app.vector_math import euclidean_distance


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate 3D image coordinates from CLIP embeddings.")
    parser.add_argument("--image-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--method", choices=["umap", "tsne", "pca"], default="umap")
    parser.add_argument("--offline-demo", action="store_true", help="Use deterministic local embeddings instead of CLIP.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image_paths = iter_images(args.image_dir)
    if len(image_paths) < 2:
        raise SystemExit("At least two images are required.")

    if args.offline_demo:
        embeddings = [deterministic_image_embedding(path) for path in image_paths]
    else:
        embeddings = [item.embedding for item in clip_image_embeddings(image_paths)]

    embedding_matrix = np.vstack(embeddings)
    coordinates = normalize_coordinates(reduce_embeddings(embedding_matrix, args.method))

    first_distance = euclidean_distance(embedding_matrix[0].tolist(), embedding_matrix[1].tolist())
    points = []
    for image_path, coordinate in zip(image_paths, coordinates, strict=True):
        points.append(
            {
                "id": image_path.stem,
                "title": image_path.stem.replace("-", " ").replace("_", " ").title(),
                "imageUrl": f"/generated/{image_path.name}",
                "clusterId": "unlabeled",
                "coordinates": [round(float(value), 4) for value in coordinate.tolist()],
            }
        )

    manifest = {
        "model": "open_clip:ViT-B-32" if not args.offline_demo else "deterministic-demo",
        "reducer": args.method,
        "distanceMetric": "euclidean",
        "firstPairDistance": first_distance,
        "points": points,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
