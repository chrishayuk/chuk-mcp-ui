import { renderToString } from "react-dom/server";
import { ConfirmRenderer } from "./App";
import type { ConfirmContent } from "./schema";

export function render(data: ConfirmContent): string {
  return renderToString(<ConfirmRenderer data={data} />);
}
