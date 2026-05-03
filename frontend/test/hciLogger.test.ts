import { describe, expect, it, vi } from "vitest";
import { HciLogger } from "@/lib/hciLogger";

describe("HciLogger", () => {
  it("tracks hover events and cluster dwell time", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("session-1");
    const logger = new HciLogger(true);

    logger.recordCamera({ at: 1000, position: [0, 0, 0], rotation: [0, 0, 0], activeClusterId: "cluster-a" });
    logger.recordCamera({ at: 1500, position: [1, 0, 0], rotation: [0, 0, 0], activeClusterId: "cluster-a" });
    logger.recordCamera({ at: 2000, position: [8, 0, 0], rotation: [0, 0, 0], activeClusterId: "cluster-b" });
    logger.recordHover({ at: 2100, imageId: "img-1", clusterId: "cluster-b", event: "enter" });

    const payload = logger.flush();

    expect(payload.sessionId).toBe("session-1");
    expect(payload.cameraPath).toHaveLength(3);
    expect(payload.hoverEvents).toHaveLength(1);
    expect(payload.clusterDwellMs["cluster-a"]).toBe(1000);
  });
});
