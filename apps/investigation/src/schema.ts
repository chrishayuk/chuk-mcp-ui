export interface InvestigationContent {
  type: "investigation";
  version: "1.0";
  title?: string;
  evidence: EvidenceItem[];
  connections?: Connection[];
  notes?: string;
}

export interface EvidenceItem {
  id: string;
  label: string;
  type: "person" | "document" | "location" | "event" | "object";
  description?: string;
  image?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface Connection {
  from: string;
  to: string;
  label?: string;
  strength?: "strong" | "medium" | "weak";
}
