import { renderToString } from "react-dom/server";
import type { PdfContent } from "./schema";

/**
 * SSR for pdf renders a static placeholder since pdf.js requires
 * browser APIs (canvas, script loading). The client bundle hydrates
 * into the full interactive PdfRenderer.
 */
export function render(data: PdfContent): string {
  return renderToString(
    <div className="flex flex-col h-full font-sans bg-background text-foreground">
      {data.title && (
        <div className="px-3 py-2 text-[15px] font-semibold border-b">
          {data.title}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
        Loading PDF…
      </div>
    </div>
  );
}
