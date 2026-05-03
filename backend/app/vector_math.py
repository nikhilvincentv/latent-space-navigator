from __future__ import annotations

from math import sqrt
from typing import Sequence


def euclidean_distance(a: Sequence[float], b: Sequence[float]) -> float:
    """Return the straight-line distance between two vectors."""
    if len(a) != len(b):
        raise ValueError("Vectors must have the same dimensionality.")

    squared_differences = []
    for index in range(len(a)):
        difference = a[index] - b[index]
        squared_differences.append(difference * difference)

    return sqrt(sum(squared_differences))


def pairwise_distance_matrix(vectors: Sequence[Sequence[float]]) -> list[list[float]]:
    return [[euclidean_distance(left, right) for right in vectors] for left in vectors]
