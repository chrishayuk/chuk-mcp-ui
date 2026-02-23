import { renderToString } from "react-dom/server";
import { GlobeRenderer } from "./App";
import type { GlobeContent } from "./schema";

export function render(data: GlobeContent): string {
  return renderToString(<GlobeRenderer data={data} />);
}
