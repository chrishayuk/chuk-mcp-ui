export interface CompareContent {
  type: "compare";
  version: "1.0";
  title?: string;
  before: CompareImage;
  after: CompareImage;
  orientation?: "horizontal" | "vertical";
  initialPosition?: number;
  labels?: {
    before?: string;
    after?: string;
  };
}

export interface CompareImage {
  url: string;
  alt?: string;
  caption?: string;
}
