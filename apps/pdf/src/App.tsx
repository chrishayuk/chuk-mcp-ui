import { useEffect, useRef, useState, useCallback } from "react";
import { useView, Fallback, CSS_VARS } from "@chuk/view-shared";
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

function PdfViewer({ data }: { data: PdfContent }) {
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

  const btnStyle: React.CSSProperties = {
    padding: "4px 10px",
    border: `1px solid var(${CSS_VARS.colorBorder})`,
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    background: `var(${CSS_VARS.colorSurface})`,
    color: `var(${CSS_VARS.colorText})`,
    cursor: "pointer",
    fontSize: "13px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: `var(${CSS_VARS.fontFamily})`,
        backgroundColor: `var(${CSS_VARS.colorBackground})`,
        color: `var(${CSS_VARS.colorText})`,
      }}
    >
      {data.title && (
        <div
          style={{
            padding: "8px 12px",
            fontSize: "15px",
            fontWeight: 600,
            borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
          }}
        >
          {data.title}
        </div>
      )}
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
          backgroundColor: `var(${CSS_VARS.colorSurface})`,
          fontSize: "13px",
          flexWrap: "wrap",
        }}
      >
        <button style={btnStyle} onClick={prevPage} disabled={currentPage <= 1}>
          Prev
        </button>
        <span>
          Page {currentPage} of {numPages}
        </span>
        <button style={btnStyle} onClick={nextPage} disabled={currentPage >= numPages}>
          Next
        </button>
        <span style={{ margin: "0 8px", color: `var(${CSS_VARS.colorBorder})` }}>|</span>
        <button style={btnStyle} onClick={zoomOut} disabled={scale <= 0.5}>
          -
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button style={btnStyle} onClick={zoomIn} disabled={scale >= 3}>
          +
        </button>
      </div>
      {/* Canvas */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
