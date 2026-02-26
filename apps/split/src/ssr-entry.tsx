import { renderToString } from "react-dom/server";
import { SplitRenderer } from "./App";
import type { SplitContent } from "./schema";

export function render(data: SplitContent): string {
  return renderToString(<SplitRenderer data={data} />);
}
