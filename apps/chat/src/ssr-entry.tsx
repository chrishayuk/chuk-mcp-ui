import { renderToString } from "react-dom/server";
import { ChatRenderer } from "./App";
import type { ChatContent } from "./schema";

export function render(data: ChatContent): string {
  return renderToString(<ChatRenderer data={data} />);
}
