export interface EmbedContent {
  type: "embed";
  version: "1.0";
  title?: string;
  url: string;
  sandbox?: string;
  allow?: string;
  aspectRatio?: string;
  toolbar?: boolean;
  fallbackText?: string;
}
