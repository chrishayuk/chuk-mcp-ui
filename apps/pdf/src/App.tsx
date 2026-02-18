import { useEffect, useRef, useState, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Button } from "@chuk/view-ui";
import type { PdfContent } from "./schema";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

let pdfjsLoadPromise: Promise<void> | null = null;

function loadPdfJs(): Promise<void> {
  if (window.pdfjsLib) return Promise.resolve();
  if (pdfjsLoadPromise) return pdfjsLoadPromise;

  pdfjsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PDFJS_CDN}/pdf.min.mjs`;
    script.type = "module";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.mjs`;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load pdf.js from CDN"));
    document.head.appendChild(script);
  });

  return pdfjsLoadPromise;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function PdfView() {
  const { data, content, isConnected } = useView<PdfContent>("pdf", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <PdfViewer data={data} />;
}

export function PdfViewer({ data }: { data: PdfContent }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(data.initialPage ?? 1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pdf.js and document
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        await loadPdfJs();

        let source: string | { data: Uint8Array };
        if (data.url.startsWith("data:application/pdf;base64,")) {
          const base64 = data.url.slice("data:application/pdf;base64,".length);
          source = { data: base64ToUint8Array(base64) };
        } else {
          source = data.url;
        }

        const doc = await window.pdfjsLib.getDocument(source).promise;
        if (cancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(Math.min(data.initialPage ?? 1, doc.numPages));
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [data.url, data.initialPage]);

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;

    async function render() {
      const page = await pdfDoc.getPage(currentPage);
      if (cancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: canvas.getContext("2d")!,
        viewport,
      }).promise;
    }

    render();
    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, scale]);

  const prevPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const nextPage = useCallback(() => setCurrentPage((p) => Math.min(numPages, p + 1)), [numPages]);
  const zoomIn = useCallback(() => setScale((s) => Math.min(3, s + 0.25)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, s - 0.25)), []);

  if (loading) return <Fallback message="Loading PDF..." />;
  if (error) return <Fallback message={error} />;

  return (
    <div className="flex flex-col h-full font-sans bg-background text-foreground">
      {data.title && (
        <div className="px-3 py-2 text-[15px] font-semibold border-b">
          {data.title}
        </div>
      )}
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted text-[13px] flex-wrap">
        <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage <= 1}>
          Prev
        </Button>
        <span>
          Page {currentPage} of {numPages}
        </span>
        <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= numPages}>
          Next
        </Button>
        <span className="mx-2 text-border">|</span>
        <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
          -
        </Button>
        <span>{Math.round(scale * 100)}%</span>
        <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3}>
          +
        </Button>
      </div>
      {/* Canvas */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
