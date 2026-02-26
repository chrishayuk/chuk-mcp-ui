import { renderToString } from "react-dom/server";
import { DataTableRenderer } from "./App";
import type { DataTableContent } from "./schema";

const noop = async () => {};

export function render(data: DataTableContent): string {
  return renderToString(<DataTableRenderer data={data} onCallTool={noop} />);
}
