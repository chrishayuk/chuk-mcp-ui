export interface SlidesContent {
  type: "slides";
  version: "1.0";
  title?: string;
  slides: Slide[];
  transition?: "fade" | "slide" | "none";
}

export interface Slide {
  title?: string;
  content: string;
  notes?: string;
  background?: string;
  layout?: "default" | "center" | "split" | "image";
  image?: string;
}
