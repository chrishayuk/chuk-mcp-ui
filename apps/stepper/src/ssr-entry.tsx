import { renderToString } from "react-dom/server";
import { StepperRenderer } from "./App";
import type { StepperContent } from "./schema";

export function render(data: StepperContent): string {
  return renderToString(<StepperRenderer data={data} />);
}
