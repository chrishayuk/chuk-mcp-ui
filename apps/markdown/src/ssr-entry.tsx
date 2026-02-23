import { renderToString } from "react-dom/server";
import { MarkdownRenderer } from "./App";
import type { MarkdownContent } from "./schema";

export function render(data: MarkdownContent): string {
  return renderToString(<MarkdownRenderer data={data} />);
}
