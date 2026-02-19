export interface CarouselAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}

export interface CarouselItem {
  id: string;
  image?: {
    url: string;
    alt?: string;
  };
  title?: string;
  description?: string;
  action?: CarouselAction;
}

export interface CarouselContent {
  type: "carousel";
  version: "1.0";
  title?: string;
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  transition?: "slide" | "fade";
}
