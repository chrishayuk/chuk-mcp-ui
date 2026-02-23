import { renderToString } from "react-dom/server";
import { ImageRenderer } from "./App";
import type { ImageContent } from "./schema";

export function render(data: ImageContent): string {
  return renderToString(<ImageRenderer data={data} />);
}
