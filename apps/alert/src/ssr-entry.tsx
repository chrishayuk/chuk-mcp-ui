import { renderToString } from "react-dom/server";
import { AlertRenderer } from "./App";
import type { AlertContent } from "./schema";

export function render(data: AlertContent): string {
  return renderToString(<AlertRenderer data={data} />);
}
