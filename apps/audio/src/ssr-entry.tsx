import { renderToString } from "react-dom/server";
import { AudioRenderer } from "./App";
import type { AudioContent } from "./schema";

export function render(data: AudioContent): string {
  return renderToString(<AudioRenderer data={data} />);
}
