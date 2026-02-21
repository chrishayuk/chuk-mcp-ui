export interface AnnotationContent {
  type: "annotation";
  version: "1.0";
  title?: string;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  annotations: Annotation[];
}

export type Annotation =
  | CircleAnnotation
  | RectAnnotation
  | ArrowAnnotation
  | TextAnnotation;

export interface CircleAnnotation {
  kind: "circle";
  id: string;
  cx: number;
  cy: number;
  r: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

export interface RectAnnotation {
  kind: "rect";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

export interface ArrowAnnotation {
  kind: "arrow";
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

export interface TextAnnotation {
  kind: "text";
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
  fontSize?: number;
}
