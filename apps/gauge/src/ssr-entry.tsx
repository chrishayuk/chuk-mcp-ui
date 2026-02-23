import { renderToString } from "react-dom/server";
import { GaugeRenderer } from "./App";
import type { GaugeContent } from "./schema";

export function render(data: GaugeContent): string {
  return renderToString(<GaugeRenderer data={data} />);
}
