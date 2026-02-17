export interface SplitContent {
  type: "split";
  version: "1.0";
  direction?: "horizontal" | "vertical";
  ratio?: string;
  left: SplitPanel;
  right: SplitPanel;
}

export interface SplitPanel {
  label?: string;
  viewUrl: string;
  structuredContent: unknown;
}
