import { renderToString } from "react-dom/server";
import { GanttRenderer } from "./App";
import type { GanttContent } from "./schema";

export function render(data: GanttContent): string {
  return renderToString(<GanttRenderer data={data} />);
}
