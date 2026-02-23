import { renderToString } from "react-dom/server";
import { PollRenderer } from "./App";
import type { PollContent } from "./schema";

export function render(data: PollContent): string {
  return renderToString(<PollRenderer data={data} />);
}
