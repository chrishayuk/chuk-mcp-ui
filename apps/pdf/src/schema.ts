export interface PdfContent {
  type: "pdf";
  version: "1.0";
  url: string;
  initialPage?: number;
  title?: string;
}
