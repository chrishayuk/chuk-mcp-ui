import { renderToString } from "react-dom/server";
import { ScatterRenderer } from "./App";
import type { ScatterContent } from "./schema";

export function render(data: ScatterContent): string {
  return renderToString(<ScatterRenderer data={data} />);
}
