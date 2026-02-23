import { renderToString } from "react-dom/server";
import { TreemapRenderer } from "./App";
import type { TreemapContent } from "./schema";

export function render(data: TreemapContent): string {
  return renderToString(<TreemapRenderer data={data} />);
}
