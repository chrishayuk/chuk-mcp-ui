import { renderToString } from "react-dom/server";
import { StatusRenderer } from "./App";
import type { StatusContent } from "./schema";

export function render(data: StatusContent): string {
  return renderToString(<StatusRenderer data={data} />);
}
