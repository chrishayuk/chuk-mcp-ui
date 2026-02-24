import { renderToString } from "react-dom/server";
import { LeafletMap } from "./App";
import type { MapContent } from "./schema";

const noop = async () => {};

export function render(data: MapContent): string {
  return renderToString(<LeafletMap data={data} app={null} onCallTool={noop} />);
}
