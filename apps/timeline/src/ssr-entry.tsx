import { renderToString } from "react-dom/server";
import { TimelineRenderer } from "./App";
import type { TimelineContent } from "./schema";

export function render(data: TimelineContent): string {
  return renderToString(<TimelineRenderer data={data} />);
}
