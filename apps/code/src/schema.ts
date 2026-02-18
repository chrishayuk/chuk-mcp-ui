export interface CodeContent {
  type: "code";
  version: "1.0";
  code: string;
  language?: string;
  title?: string;
  lineNumbers?: boolean;
  highlightLines?: number[];
}
