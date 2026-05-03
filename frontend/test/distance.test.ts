import { describe, expect, it } from "vitest";
import { euclideanDistance, nearestCluster } from "@/lib/distance";

describe("distance utilities", () => {
  it("computes explicit 3D Euclidean distance", () => {
    expect(euclideanDistance([0, 0, 0], [3, 4, 12])).toBe(13);
  });

  it("finds the nearest cluster centroid", () => {
    expect(
      nearestCluster([9, 1, 0], {
        calm: [0, 0, 0],
        kinetic: [10, 0, 0]
      })
    ).toBe("kinetic");
  });
});
