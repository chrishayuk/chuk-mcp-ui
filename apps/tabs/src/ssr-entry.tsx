import { renderToString } from "react-dom/server";
import { TabsInner } from "./App";
import type { TabsContent } from "./schema";

export function render(data: TabsContent): string {
  return renderToString(<TabsInner data={data} />);
}
