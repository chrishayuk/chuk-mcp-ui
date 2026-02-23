import { renderToString } from "react-dom/server";
import { SunburstRenderer } from "./App";
import type { SunburstContent } from "./schema";

export function render(data: SunburstContent): string {
  return renderToString(<SunburstRenderer data={data} />);
}
