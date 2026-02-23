import { renderToString } from "react-dom/server";
import { ThreedRenderer } from "./App";
import type { ThreedContent } from "./schema";

export function render(data: ThreedContent): string {
  return renderToString(<ThreedRenderer data={data} />);
}
