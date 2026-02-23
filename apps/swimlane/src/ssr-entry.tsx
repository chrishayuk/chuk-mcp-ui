import { renderToString } from "react-dom/server";
import { SwimlaneRenderer } from "./App";
import type { SwimlaneContent } from "./schema";

export function render(data: SwimlaneContent): string {
  return renderToString(<SwimlaneRenderer data={data} />);
}
