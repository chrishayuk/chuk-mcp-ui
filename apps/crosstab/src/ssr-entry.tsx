import { renderToString } from "react-dom/server";
import { CrosstabRenderer } from "./App";
import type { CrosstabContent } from "./schema";

export function render(data: CrosstabContent): string {
  return renderToString(<CrosstabRenderer data={data} />);
}
