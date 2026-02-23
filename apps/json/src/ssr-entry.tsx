import { renderToString } from "react-dom/server";
import { JsonRenderer } from "./App";
import type { JsonContent } from "./schema";

export function render(data: JsonContent): string {
  return renderToString(<JsonRenderer data={data} />);
}
