import pytest

from app.vector_math import euclidean_distance, pairwise_distance_matrix


def test_euclidean_distance_is_explicit() -> None:
    assert euclidean_distance([0, 0, 0], [3, 4, 12]) == 13


def test_euclidean_distance_rejects_mismatched_dimensions() -> None:
    with pytest.raises(ValueError):
        euclidean_distance([1, 2], [1, 2, 3])


def test_pairwise_distance_matrix() -> None:
    matrix = pairwise_distance_matrix([[0, 0], [3, 4]])
    assert matrix == [[0, 5], [5, 0]]
