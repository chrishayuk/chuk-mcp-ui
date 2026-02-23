import { renderToString } from "react-dom/server";
import { DynamicForm } from "./App";
import type { FormContent } from "./schema";

export function render(data: FormContent): string {
  return renderToString(<DynamicForm data={data} />);
}
