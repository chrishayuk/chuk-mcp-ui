import { renderToString } from "react-dom/server";
import { WizardRenderer } from "./App";
import type { WizardContent } from "./schema";

export function render(data: WizardContent): string {
  return renderToString(<WizardRenderer data={data} />);
}
