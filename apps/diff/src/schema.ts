export interface DiffLine {
  type: "context" | "add" | "remove";
  content: string;
  lineA?: number;
  lineB?: number;
}

export interface DiffHunk {
  headerA: string;
  headerB?: string;
  lines: DiffLine[];
}

export interface DiffContent {
  type: "diff";
  version: "1.0";
  title?: string;
  language?: string;
  mode?: "unified" | "split";
  fileA?: string;
  fileB?: string;
  hunks: DiffHunk[];
}
