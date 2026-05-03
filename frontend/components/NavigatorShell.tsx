"use client";

import { Download, MousePointer2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { LatentScene } from "@/components/LatentScene";
import { HciLogger } from "@/lib/hciLogger";
import type { ImagePoint } from "@/lib/types";

export function NavigatorShell({ points }: { points: ImagePoint[] }) {
  const logger = useRef(new HciLogger());
  const [selected, setSelected] = useState<ImagePoint | null>(points[0] ?? null);
  const clusterCount = useMemo(() => new Set(points.map((point) => point.clusterId)).size, [points]);

  function exportStudyLog() {
    const payload = logger.current.flush();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `latent-navigation-${payload.sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-ink">
      <LatentScene points={points} logger={logger.current} onSelect={setSelected} />

      <section className="pointer-events-none absolute left-5 top-5 max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan">CMU HCI Portfolio Study</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight text-mist">Latent Space Navigator</h1>
        <p className="mt-3 text-sm leading-6 text-mist/78">
          Fly through CLIP-derived image style coordinates. Spatial proximity represents lower Euclidean distance after
          dimensionality reduction.
        </p>
      </section>

      <aside className="absolute bottom-5 left-5 grid w-[min(420px,calc(100vw-40px))] gap-3 rounded-md border border-white/10 bg-ink/82 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-mist/55">Current image</p>
            <h2 className="text-lg font-medium text-mist">{selected?.title ?? "None selected"}</h2>
          </div>
          <button
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/8 text-mist transition hover:bg-white/14"
            onClick={exportStudyLog}
            title="Export HCI study log"
          >
            <Download size={18} />
          </button>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-mist/50">Images</dt>
            <dd className="font-medium text-mist">{points.length}</dd>
          </div>
          <div>
            <dt className="text-mist/50">Clusters</dt>
            <dd className="font-medium text-mist">{clusterCount}</dd>
          </div>
          <div>
            <dt className="text-mist/50">Mode</dt>
            <dd className="font-medium text-mist">Fly</dd>
          </div>
        </dl>
        <p className="inline-flex items-center gap-2 text-xs text-mist/58">
          <MousePointer2 size={14} /> WASD to move, mouse drag to turn, hover images to log attention.
        </p>
      </aside>
    </main>
  );
}
