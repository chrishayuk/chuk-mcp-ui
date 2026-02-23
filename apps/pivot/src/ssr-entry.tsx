import { renderToString } from "react-dom/server";
import { PivotRenderer } from "./App";
import type { PivotContent } from "./schema";

export function render(data: PivotContent): string {
  return renderToString(<PivotRenderer data={data} />);
}
