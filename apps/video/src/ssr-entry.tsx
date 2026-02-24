import { renderToString } from "react-dom/server";
import { VideoRenderer } from "./App";
import type { VideoContent } from "./schema";

export function render(data: VideoContent): string {
  return renderToString(<VideoRenderer data={data} />);
}
