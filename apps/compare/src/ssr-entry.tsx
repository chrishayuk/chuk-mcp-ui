import { renderToString } from "react-dom/server";
import { CompareRenderer } from "./App";
import type { CompareContent } from "./schema";

export function render(data: CompareContent): string {
  return renderToString(<CompareRenderer data={data} />);
}
