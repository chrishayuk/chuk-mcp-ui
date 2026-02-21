export interface NotebookContent {
  type: "notebook";
  version: "1.0";
  title?: string;
  cells: NotebookCell[];
}

export type NotebookCell =
  | MarkdownCell
  | CodeCell
  | TableCell
  | ImageCell
  | CounterCell;

export interface MarkdownCell {
  cellType: "markdown";
  source: string;
  collapsed?: boolean;
}

export interface CodeCell {
  cellType: "code";
  source: string;
  language?: string;
  output?: string;
  collapsed?: boolean;
}

export interface TableCell {
  cellType: "table";
  columns: string[];
  rows: string[][];
  caption?: string;
  collapsed?: boolean;
}

export interface ImageCell {
  cellType: "image";
  url: string;
  alt?: string;
  caption?: string;
  collapsed?: boolean;
}

export interface CounterCell {
  cellType: "counter";
  value: number;
  label?: string;
  collapsed?: boolean;
}
