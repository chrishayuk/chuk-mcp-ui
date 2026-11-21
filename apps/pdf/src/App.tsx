import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
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

  return <PdfRenderer data={data} />;
}

export function PdfRenderer({ data }: { data: PdfContent }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(data.initialPage ?? 1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState<number | null>(null);
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

  // Auto-fit to container width on first load
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;
    let cancelled = false;

    async function fitToWidth() {
      const page = await pdfDoc.getPage(1);
      if (cancelled) return;
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current!.clientWidth - 32; // minus p-4 padding
      const fitScale = containerWidth / viewport.width;
      setScale(Math.min(5, Math.max(0.25, fitScale)));
    }

    fitToWidth();
    return () => { cancelled = true; };
  }, [pdfDoc]);

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || scale === null) return;
    let cancelled = false;

    async function render() {
      const page = await pdfDoc.getPage(currentPage);
      if (cancelled) return;

      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * dpr });
      const canvas = canvasRef.current!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

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
  const zoomIn = useCallback(() => setScale((s) => Math.min(5, (s ?? 1) + 0.25)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.25, (s ?? 1) - 0.25)), []);

  if (loading) return <Fallback message="Loading PDF..." />;
  if (error) return <Fallback message={error} />;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full font-sans bg-background text-foreground"
    >
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
        <Button variant="outline" size="sm" onClick={zoomOut} disabled={(scale ?? 1) <= 0.25}>
          -
        </Button>
        <span>{scale !== null ? `${Math.round(scale * 100)}%` : "..."}</span>
        <Button variant="outline" size="sm" onClick={zoomIn} disabled={(scale ?? 1) >= 5}>
          +
        </Button>
      </div>
      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center p-4">
        <canvas ref={canvasRef} className="shrink-0" />
      </div>
    </motion.div>
  );
}
