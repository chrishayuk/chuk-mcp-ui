import { renderToString } from "react-dom/server";
import { NotebookRenderer } from "./App";
import type { NotebookContent } from "./schema";

export function render(data: NotebookContent): string {
  return renderToString(<NotebookRenderer data={data} />);
}
