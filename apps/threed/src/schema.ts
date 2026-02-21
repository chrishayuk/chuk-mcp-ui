export interface ThreedContent {
  type: "threed";
  version: "1.0";
  title?: string;
  objects: ThreedObject[];
  camera?: {
    position?: [number, number, number];
    target?: [number, number, number];
  };
  background?: string;
}

export interface ThreedObject {
  id: string;
  geometry: "box" | "sphere" | "cylinder" | "cone" | "torus";
  position: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  label?: string;
  wireframe?: boolean;
}
