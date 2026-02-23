import { renderToString } from "react-dom/server";
import { CounterRenderer } from "./App";
import type { CounterContent } from "./schema";

export function render(data: CounterContent): string {
  return renderToString(<CounterRenderer data={data} />);
}
