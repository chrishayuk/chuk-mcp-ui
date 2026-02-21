export interface GeostoryContent {
  type: "geostory";
  version: "1.0";
  title?: string;
  steps: GeostoryStep[];
  basemap?: "terrain" | "satellite" | "simple";
}

export interface GeostoryStep {
  id: string;
  title: string;
  text: string;
  location: {
    lat: number;
    lon: number;
  };
  zoom?: number;
  image?: string;
  marker?: string;
}
