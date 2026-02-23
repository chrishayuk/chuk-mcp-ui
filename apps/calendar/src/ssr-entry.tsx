import { renderToString } from "react-dom/server";
import { CalendarRenderer } from "./App";
import type { CalendarContent } from "./schema";

export function render(data: CalendarContent): string {
  return renderToString(<CalendarRenderer data={data} />);
}
