import { renderToString } from "react-dom/server";
import { DataTable } from "./App";
import type { DataTableContent } from "./schema";

const noop = async () => {};

export function render(data: DataTableContent): string {
  return renderToString(<DataTable data={data} onCallTool={noop} />);
}
