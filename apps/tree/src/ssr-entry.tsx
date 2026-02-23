import { renderToString } from "react-dom/server";
import { TreeRenderer } from "./App";
import type { TreeContent } from "./schema";

export function render(data: TreeContent): string {
  return renderToString(<TreeRenderer data={data} />);
}
