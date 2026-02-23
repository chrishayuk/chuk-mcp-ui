import { renderToString } from "react-dom/server";
import { BoxplotRenderer } from "./App";
import type { BoxplotContent } from "./schema";

export function render(data: BoxplotContent): string {
  return renderToString(<BoxplotRenderer data={data} />);
}
