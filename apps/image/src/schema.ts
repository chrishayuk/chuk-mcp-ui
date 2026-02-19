export interface ImageContent {
  type: "image";
  version: "1.0";
  title?: string;
  images: ImageItem[];
  activeIndex?: number;
  annotations?: ImageAnnotation[];
  controls?: ImageControls;
}

export interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ImageAnnotation {
  id: string;
  imageId: string;
  type: "circle" | "rect" | "point" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  label?: string;
  color?: string;
  description?: string;
}

export interface ImageControls {
  zoom?: boolean;
  fullscreen?: boolean;
  thumbnails?: boolean;
}
