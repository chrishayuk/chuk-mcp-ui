import { renderToString } from "react-dom/server";
import { AnnotationRenderer } from "./App";
import type { AnnotationContent } from "./schema";

export function render(data: AnnotationContent): string {
  return renderToString(<AnnotationRenderer data={data} />);
}
