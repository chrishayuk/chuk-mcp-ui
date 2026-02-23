import { renderToString } from "react-dom/server";
import { QuizRenderer } from "./App";
import type { QuizContent } from "./schema";

export function render(data: QuizContent): string {
  return renderToString(<QuizRenderer data={data} />);
}
