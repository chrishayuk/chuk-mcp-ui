import { renderToString } from "react-dom/server";
import { DetailRenderer } from "./App";
import type { DetailContent } from "./schema";

export function render(data: DetailContent): string {
  return renderToString(<DetailRenderer data={data} />);
}
