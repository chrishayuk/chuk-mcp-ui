export interface DetailContent {
  type: "detail";
  version: "1.0";
  title: string;
  subtitle?: string;
  image?: { url: string; alt?: string };
  fields: DetailField[];
  actions?: DetailAction[];
  sections?: DetailSection[];
}

export interface DetailField {
  label: string;
  value: string;
  type?: "text" | "link" | "badge" | "date" | "email";
}

export interface DetailAction {
  label: string;
  tool: string;
  args?: Record<string, unknown>;
}

export interface DetailSection {
  title: string;
  fields: DetailField[];
}
