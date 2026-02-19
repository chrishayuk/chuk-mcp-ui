export interface TreeContent {
  type: "tree";
  version: "1.0";
  title?: string;
  roots: TreeNode[];
  selection?: "none" | "single" | "multi";
  searchable?: boolean;
  expandDepth?: number;
  loadChildrenTool?: string;
}

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  badge?: TreeBadge;
  children?: TreeNode[];
  hasChildren?: boolean;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TreeBadge {
  label: string;
  color?: string;
}
