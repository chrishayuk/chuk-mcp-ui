import { renderToString } from "react-dom/server";
import { FlowchartRenderer } from "./App";
import type { FlowchartContent } from "./schema";

export function render(data: FlowchartContent): string {
  return renderToString(<FlowchartRenderer data={data} />);
}
