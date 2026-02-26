import { renderToString } from "react-dom/server";
import { FormRenderer } from "./App";
import type { FormContent } from "./schema";

export function render(data: FormContent): string {
  return renderToString(<FormRenderer data={data} />);
}
