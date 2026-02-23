import { renderToString } from "react-dom/server";
import { FunnelRenderer } from "./App";
import type { FunnelContent } from "./schema";

export function render(data: FunnelContent): string {
  return renderToString(<FunnelRenderer data={data} />);
}
