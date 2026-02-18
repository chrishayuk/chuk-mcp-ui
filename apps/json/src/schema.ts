export interface JsonContent {
  type: "json";
  version: "1.0";
  data: unknown;
  title?: string;
  expandDepth?: number;
  searchable?: boolean;
}
