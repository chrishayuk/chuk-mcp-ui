import { renderToString } from "react-dom/server";
import { DiffRenderer } from "./App";
import type { DiffContent } from "./schema";

export function render(data: DiffContent): string {
  return renderToString(<DiffRenderer data={data} />);
}
