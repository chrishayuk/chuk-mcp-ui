import { renderToString } from "react-dom/server";
import { FilterRenderer } from "./App";
import type { FilterContent } from "./schema";

export function render(data: FilterContent): string {
  return renderToString(<FilterRenderer data={data} />);
}
