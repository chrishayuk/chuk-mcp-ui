export interface TerminalContent {
  type: "terminal";
  version: "1.0";
  title?: string;
  lines: TerminalLine[];
  scrollback?: number;
  fontSize?: TerminalFontSize;
  showLineNumbers?: boolean;
  theme?: TerminalTheme;
}

export interface TerminalLine {
  text: string;
  timestamp?: string;
}

export type TerminalFontSize = "xs" | "sm" | "md" | "lg";

export type TerminalTheme = "dark" | "light" | "green" | "amber";
