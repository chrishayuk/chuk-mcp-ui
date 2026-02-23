import { renderToString } from "react-dom/server";
import { LogRenderer } from "./App";
import type { LogContent } from "./schema";

export function render(data: LogContent): string {
  return renderToString(<LogRenderer data={data} />);
}
