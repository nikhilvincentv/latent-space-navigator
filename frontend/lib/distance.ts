import type { Vec3 } from "./types";

export function euclideanDistance(a: Vec3, b: Vec3): number {
  const squaredDelta = a.reduce((sum, value, index) => {
    const difference = value - b[index];
    return sum + difference * difference;
  }, 0);

  return Math.sqrt(squaredDelta);
}

export function nearestCluster(position: Vec3, centroids: Record<string, Vec3>): string | undefined {
  return Object.entries(centroids).reduce<{ id?: string; distance: number }>(
    (nearest, [id, centroid]) => {
      const distance = euclideanDistance(position, centroid);
      return distance < nearest.distance ? { id, distance } : nearest;
    },
    { distance: Number.POSITIVE_INFINITY }
  ).id;
}
