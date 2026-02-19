export interface SettingsContent {
  type: "settings";
  version: "1.0";
  title?: string;
  sections: SettingsSection[];
  saveTool?: string;
  autoSave?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  fields: SettingsField[];
}

export interface SettingsField {
  id: string;
  label: string;
  description?: string;
  type: "toggle" | "select" | "text" | "number" | "slider" | "radio" | "color";
  value: unknown;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}
