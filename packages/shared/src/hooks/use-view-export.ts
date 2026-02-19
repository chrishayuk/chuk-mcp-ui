import { useState, useCallback, useEffect, useRef } from "react";
import { useViewBus } from "../bus";

export interface ColumnDef {
  key: string;
  label: string;
}

export interface ViewExportState {
  exportPng: (filename?: string) => Promise<void>;
  exportCsv: (
    columns: ColumnDef[],
    rows: Record<string, unknown>[],
    filename?: string
  ) => void;
  exportJson: (data: unknown, filename?: string) => void;
  isExporting: boolean;
}

interface UseViewExportOptions {
  containerRef?: React.RefObject<HTMLElement>;
  panelId?: string;
  onExportRequest?: (format: "png" | "csv" | "json") => void;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

function escapeCsvValue(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Standardized export hook for MCP Views.
 *
 * Provides PNG (via dynamic html2canvas import), CSV, and JSON export.
 * Subscribes to `export-request` bus messages to handle export requests
 * from sibling Views or containers.
 */
export function useViewExport(
  options: UseViewExportOptions = {}
): ViewExportState {
  const { containerRef, onExportRequest } = options;
  const bus = useViewBus({ panelId: options.panelId });
  const [isExporting, setIsExporting] = useState(false);
  const onExportRequestRef = useRef(onExportRequest);
  onExportRequestRef.current = onExportRequest;

  const exportPng = useCallback(
    async (filename = "export.png") => {
      if (!containerRef?.current) return;
      setIsExporting(true);
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(containerRef.current);
        const url = canvas.toDataURL("image/png");
        triggerDownload(url, filename);
      } catch {
        console.warn(
          "useViewExport: PNG export failed. Ensure html2canvas is installed."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [containerRef]
  );

  const exportCsv = useCallback(
    (
      columns: ColumnDef[],
      rows: Record<string, unknown>[],
      filename = "export.csv"
    ) => {
      const header = columns.map((c) => escapeCsvValue(c.label)).join(",");
      const body = rows
        .map((row) =>
          columns.map((col) => escapeCsvValue(row[col.key])).join(",")
        )
        .join("\n");
      const csv = header + "\n" + body;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      triggerDownload(URL.createObjectURL(blob), filename);
    },
    []
  );

  const exportJson = useCallback((data: unknown, filename = "export.json") => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    triggerDownload(URL.createObjectURL(blob), filename);
  }, []);

  useEffect(() => {
    const unsub = bus.subscribe("export-request", (msg) => {
      onExportRequestRef.current?.(msg.format);
    });
    return unsub;
  }, [bus]);

  return { exportPng, exportCsv, exportJson, isExporting };
}
