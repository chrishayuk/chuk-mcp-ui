import { renderToString } from "react-dom/server";
import { Split } from "./App";
import type { SplitContent } from "./schema";

export function render(data: SplitContent): string {
  return renderToString(<Split data={data} />);
}
