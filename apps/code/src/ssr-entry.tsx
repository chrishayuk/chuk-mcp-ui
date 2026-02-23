import { renderToString } from "react-dom/server";
import { CodeRenderer } from "./App";
import type { CodeContent } from "./schema";

export function render(data: CodeContent): string {
  return renderToString(<CodeRenderer data={data} />);
}
