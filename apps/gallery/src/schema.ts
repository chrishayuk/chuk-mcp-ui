export interface GalleryContent {
  type: "gallery";
  version: "1.0";
  title?: string;
  items: GalleryItem[];
  columns?: 1 | 2 | 3 | 4;
  filterable?: boolean;
  sortable?: boolean;
  sortFields?: string[];
  emptyMessage?: string;
  /** App-only tool to reload gallery data (visibility: ["app"]) */
  refreshTool?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: { url: string; alt?: string };
  badges?: GalleryBadge[];
  metadata?: Record<string, string>;
  actions?: GalleryAction[];
}

export interface GalleryBadge {
  label: string;
  variant?: "default" | "secondary" | "outline";
}

export interface GalleryAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}
