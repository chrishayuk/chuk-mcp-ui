import { renderToString } from "react-dom/server";
import { EmbedRenderer } from "./App";
import type { EmbedContent } from "./schema";

export function render(data: EmbedContent): string {
  return renderToString(<EmbedRenderer data={data} />);
}
