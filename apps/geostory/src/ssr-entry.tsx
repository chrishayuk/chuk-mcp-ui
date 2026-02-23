import { renderToString } from "react-dom/server";
import { GeostoryRenderer } from "./App";
import type { GeostoryContent } from "./schema";

export function render(data: GeostoryContent): string {
  return renderToString(<GeostoryRenderer data={data} />);
}
