from pathlib import Path

import numpy as np

from app.embedding_pipeline import deterministic_image_embedding, normalize_coordinates


def test_deterministic_embedding_is_stable(tmp_path: Path) -> None:
    image = tmp_path / "sample.png"
    image.write_bytes(b"not-a-real-image-but-stable")

    first = deterministic_image_embedding(image)
    second = deterministic_image_embedding(image)

    assert np.allclose(first, second)
    assert first.shape == (512,)


def test_normalize_coordinates_scales_to_requested_range() -> None:
    coordinates = np.array([[0.0, 0.0, 0.0], [10.0, 5.0, -5.0]])
    normalized = normalize_coordinates(coordinates, scale=4.0)

    assert normalized.shape == (2, 3)
    assert np.abs(normalized).max() == 4.0
