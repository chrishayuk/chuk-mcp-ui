import { renderToString } from "react-dom/server";
import { CarouselRenderer } from "./App";
import type { CarouselContent } from "./schema";

export function render(data: CarouselContent): string {
  return renderToString(<CarouselRenderer data={data} />);
}
