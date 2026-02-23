import { renderToString } from "react-dom/server";
import { GraphRenderer } from "./App";
import type { GraphContent } from "./schema";

export function render(data: GraphContent): string {
  return renderToString(<GraphRenderer data={data} />);
}
