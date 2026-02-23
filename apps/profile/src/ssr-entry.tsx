import { renderToString } from "react-dom/server";
import { ProfileRenderer } from "./App";
import type { ProfileContent } from "./schema";

export function render(data: ProfileContent): string {
  return renderToString(<ProfileRenderer data={data} />);
}
