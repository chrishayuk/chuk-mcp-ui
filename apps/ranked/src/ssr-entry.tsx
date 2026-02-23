import { renderToString } from "react-dom/server";
import { RankedRenderer } from "./App";
import type { RankedContent } from "./schema";

export function render(data: RankedContent): string {
  return renderToString(<RankedRenderer data={data} />);
}
