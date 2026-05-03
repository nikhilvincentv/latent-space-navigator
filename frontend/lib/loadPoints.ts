import samplePoints from "../data/coordinates.json";
import type { ImagePoint } from "./types";

export async function loadSamplePoints(): Promise<ImagePoint[]> {
  return samplePoints.points.map((point) => {
    if (point.coordinates.length !== 3) {
      throw new Error(`Point ${point.id} must have exactly three coordinates.`);
    }

    return {
      ...point,
      coordinates: [point.coordinates[0], point.coordinates[1], point.coordinates[2]] as [number, number, number]
    };
  });
}
