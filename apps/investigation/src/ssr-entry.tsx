import { renderToString } from "react-dom/server";
import { InvestigationRenderer } from "./App";
import type { InvestigationContent } from "./schema";

export function render(data: InvestigationContent): string {
  return renderToString(<InvestigationRenderer data={data} />);
}
