"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image, Stars, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { Group, PerspectiveCamera, Vector3Tuple } from "three";
import { Euler, Vector3 } from "three";
import { HciLogger } from "@/lib/hciLogger";
import { nearestCluster } from "@/lib/distance";
import type { ImagePoint, Vec3 } from "@/lib/types";

type SceneProps = {
  points: ImagePoint[];
  logger: HciLogger;
  onSelect: (point: ImagePoint) => void;
};

export function LatentScene(props: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 65 }} dpr={[1, 2]}>
      <color attach="background" args={["#111315"]} />
      <fog attach="fog" args={["#111315", 10, 58]} />
      <ambientLight intensity={1.1} />
      <pointLight position={[8, 10, 8]} intensity={18} color="#32c7d6" />
      <Stars radius={80} depth={30} count={1400} factor={2.4} saturation={0.2} fade speed={0.35} />
      <FlyControls logger={props.logger} points={props.points} />
      <ClusterLabels points={props.points} />
      {props.points.map((point) => (
        <ImageSprite key={point.id} point={point} logger={props.logger} onSelect={props.onSelect} />
      ))}
    </Canvas>
  );
}

function ImageSprite({ point, logger, onSelect }: { point: ImagePoint; logger: HciLogger; onSelect: (point: ImagePoint) => void }) {
  const group = useRef<Group>(null);

  useFrame(({ camera }) => {
    group.current?.lookAt(camera.position);
  });

  return (
    <group ref={group} position={point.coordinates as Vector3Tuple}>
      <Image
        url={point.imageUrl}
        scale={[1.45, 1.05]}
        transparent
        onPointerEnter={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          logger.recordHover({ at: Date.now(), imageId: point.id, clusterId: point.clusterId, event: "enter" });
          onSelect(point);
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "default";
          logger.recordHover({ at: Date.now(), imageId: point.id, clusterId: point.clusterId, event: "leave" });
        }}
        onClick={() => onSelect(point)}
      />
      <Text position={[0, -0.78, 0]} fontSize={0.14} color="#edf1f4" anchorX="center" anchorY="middle" maxWidth={1.8}>
        {point.title}
      </Text>
    </group>
  );
}

function ClusterLabels({ points }: { points: ImagePoint[] }) {
  const centers = useMemo(() => computeCentroids(points), [points]);

  return (
    <>
      {Object.entries(centers).map(([clusterId, position]) => (
        <Text key={clusterId} position={position} fontSize={0.42} color="#ff6b5f" anchorX="center" anchorY="middle">
          {clusterId}
        </Text>
      ))}
    </>
  );
}

function FlyControls({ logger, points }: { logger: HciLogger; points: ImagePoint[] }) {
  const keys = useRef(new Set<string>());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const lastLogAt = useRef(0);
  const pointerDown = useRef(false);
  const { camera, gl } = useThree();
  const centroids = useMemo(() => computeCentroids(points), [points]);

  useEffect(() => {
    const element = gl.domElement;

    function handleKeyDown(event: KeyboardEvent) {
      keys.current.add(event.key.toLowerCase());
    }

    function handleKeyUp(event: KeyboardEvent) {
      keys.current.delete(event.key.toLowerCase());
    }

    function handlePointerDown() {
      pointerDown.current = true;
    }

    function handlePointerUp() {
      pointerDown.current = false;
    }

    function handlePointerMove(event: PointerEvent) {
      if (!pointerDown.current) return;
      yaw.current -= event.movementX * 0.003;
      pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current - event.movementY * 0.003));
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
    };
  }, [gl.domElement]);

  useFrame((_, delta) => {
    const typedCamera = camera as PerspectiveCamera;
    typedCamera.rotation.copy(new Euler(pitch.current, yaw.current, 0, "YXZ"));

    const direction = new Vector3();
    const right = new Vector3();
    typedCamera.getWorldDirection(direction);
    right.crossVectors(direction, typedCamera.up).normalize();

    const velocity = new Vector3();
    if (keys.current.has("w")) velocity.add(direction);
    if (keys.current.has("s")) velocity.sub(direction);
    if (keys.current.has("d")) velocity.add(right);
    if (keys.current.has("a")) velocity.sub(right);
    if (keys.current.has("e")) velocity.y += 1;
    if (keys.current.has("q")) velocity.y -= 1;

    if (velocity.lengthSq() > 0) {
      velocity.normalize().multiplyScalar(delta * 7.5);
      typedCamera.position.add(velocity);
    }

    const now = Date.now();
    if (now - lastLogAt.current > 500) {
      lastLogAt.current = now;
      const position = typedCamera.position.toArray() as Vec3;
      logger.recordCamera({
        at: now,
        position,
        rotation: [typedCamera.rotation.x, typedCamera.rotation.y, typedCamera.rotation.z],
        activeClusterId: nearestCluster(position, centroids)
      });
    }
  });

  return null;
}

function computeCentroids(points: ImagePoint[]): Record<string, Vec3> {
  const buckets = new Map<string, { total: Vec3; count: number }>();

  for (const point of points) {
    const current = buckets.get(point.clusterId) ?? { total: [0, 0, 0], count: 0 };
    current.total = [
      current.total[0] + point.coordinates[0],
      current.total[1] + point.coordinates[1],
      current.total[2] + point.coordinates[2]
    ];
    current.count += 1;
    buckets.set(point.clusterId, current);
  }

  return Object.fromEntries(
    [...buckets.entries()].map(([clusterId, value]) => [
      clusterId,
      [value.total[0] / value.count, value.total[1] / value.count, value.total[2] / value.count] satisfies Vec3
    ])
  );
}
