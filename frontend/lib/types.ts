export type Vec3 = [number, number, number];

export type ImagePoint = {
  id: string;
  title: string;
  imageUrl: string;
  clusterId: string;
  coordinates: Vec3;
};

export type CameraSample = {
  at: number;
  position: Vec3;
  rotation: Vec3;
  activeClusterId?: string;
};

export type HoverSample = {
  at: number;
  imageId: string;
  clusterId: string;
  event: "enter" | "leave";
};
