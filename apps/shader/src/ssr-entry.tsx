import { renderToString } from "react-dom/server";
import { ShaderRenderer } from "./App";
import type { ShaderContent } from "./schema";

export function render(data: ShaderContent): string {
  return renderToString(<ShaderRenderer data={data} />);
}
