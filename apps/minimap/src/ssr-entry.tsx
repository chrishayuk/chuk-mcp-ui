import { renderToString } from "react-dom/server";
import { MinimapRenderer } from "./App";
import type { MinimapContent } from "./schema";

export function render(data: MinimapContent): string {
  return renderToString(<MinimapRenderer data={data} />);
}
