import { renderToString } from "react-dom/server";
import { TerminalRenderer } from "./App";
import type { TerminalContent } from "./schema";

export function render(data: TerminalContent): string {
  return renderToString(<TerminalRenderer data={data} />);
}
