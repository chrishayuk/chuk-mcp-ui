import { renderToString } from "react-dom/server";
import { KanbanRenderer } from "./App";
import type { KanbanContent } from "./schema";

export function render(data: KanbanContent): string {
  return renderToString(<KanbanRenderer data={data} />);
}
