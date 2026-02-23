import { renderToString } from "react-dom/server";
import { SankeyRenderer } from "./App";
import type { SankeyContent } from "./schema";

export function render(data: SankeyContent): string {
  return renderToString(<SankeyRenderer data={data} />);
}
