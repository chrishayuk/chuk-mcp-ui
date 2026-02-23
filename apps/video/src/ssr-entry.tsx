import { renderToString } from "react-dom/server";
import { VideoPlayer } from "./App";
import type { VideoContent } from "./schema";

export function render(data: VideoContent): string {
  return renderToString(<VideoPlayer data={data} />);
}
