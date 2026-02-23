import { renderToString } from "react-dom/server";
import { SlidesRenderer } from "./App";
import type { SlidesContent } from "./schema";

export function render(data: SlidesContent): string {
  return renderToString(<SlidesRenderer data={data} />);
}
