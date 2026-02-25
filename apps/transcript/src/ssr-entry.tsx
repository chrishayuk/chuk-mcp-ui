import { renderToString } from "react-dom/server";
import { TranscriptRenderer } from "./App";
import type { TranscriptContent } from "./schema";

export function render(data: TranscriptContent): string {
  return renderToString(<TranscriptRenderer data={data} />);
}
