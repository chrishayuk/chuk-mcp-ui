import { renderToString } from "react-dom/server";
import { GalleryRenderer } from "./App";
import type { GalleryContent } from "./schema";

export function render(data: GalleryContent): string {
  return renderToString(<GalleryRenderer data={data} />);
}
