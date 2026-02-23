import { renderToString } from "react-dom/server";
import { SpectrogramRenderer } from "./App";
import type { SpectrogramContent } from "./schema";

export function render(data: SpectrogramContent): string {
  return renderToString(<SpectrogramRenderer data={data} />);
}
