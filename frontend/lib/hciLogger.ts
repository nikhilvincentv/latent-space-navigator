import type { CameraSample, HoverSample } from "./types";

type LogPayload = {
  sessionId: string;
  cameraPath: CameraSample[];
  hoverEvents: HoverSample[];
  clusterDwellMs: Record<string, number>;
};

export class HciLogger {
  private readonly sessionId: string;
  private readonly enabled: boolean;
  private cameraPath: CameraSample[] = [];
  private hoverEvents: HoverSample[] = [];
  private clusterDwellMs: Record<string, number> = {};
  private activeClusterId?: string;
  private activeClusterStartedAt?: number;

  constructor(enabled = process.env.NEXT_PUBLIC_HCI_LOGGING_ENABLED !== "false") {
    this.sessionId = crypto.randomUUID();
    this.enabled = enabled;
  }

  recordCamera(sample: CameraSample) {
    if (!this.enabled) return;
    this.cameraPath.push(sample);
    this.recordCluster(sample.activeClusterId, sample.at);
  }

  recordHover(event: HoverSample) {
    if (!this.enabled) return;
    this.hoverEvents.push(event);
  }

  flush(): LogPayload {
    const now = Date.now();
    this.recordCluster(undefined, now);

    const payload: LogPayload = {
      sessionId: this.sessionId,
      cameraPath: [...this.cameraPath],
      hoverEvents: [...this.hoverEvents],
      clusterDwellMs: { ...this.clusterDwellMs }
    };

    this.cameraPath = [];
    this.hoverEvents = [];
    return payload;
  }

  private recordCluster(nextClusterId: string | undefined, at: number) {
    if (nextClusterId !== this.activeClusterId) {
      if (this.activeClusterId && this.activeClusterStartedAt !== undefined) {
        const elapsed = Math.max(0, at - this.activeClusterStartedAt);
        this.clusterDwellMs[this.activeClusterId] = (this.clusterDwellMs[this.activeClusterId] ?? 0) + elapsed;
      }
      this.activeClusterId = nextClusterId;
      this.activeClusterStartedAt = nextClusterId ? at : undefined;
    } else if (this.activeClusterStartedAt === undefined && nextClusterId) {
      this.activeClusterStartedAt = at;
    }
  }
}
