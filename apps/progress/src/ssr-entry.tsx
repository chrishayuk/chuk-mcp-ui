import { renderToString } from "react-dom/server";
import { ProgressRenderer } from "./App";
import type { ProgressContent } from "./schema";

export function render(data: ProgressContent): string {
  return renderToString(<ProgressRenderer data={data} />);
}
