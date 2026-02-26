import { renderToString } from "react-dom/server";
import { TabsRenderer } from "./App";
import type { TabsContent } from "./schema";

export function render(data: TabsContent): string {
  return renderToString(<TabsRenderer data={data} />);
}
