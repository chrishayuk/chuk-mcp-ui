export interface TabsContent {
  type: "tabs";
  version: "1.0";
  activeTab?: string;
  tabs: Tab[];
}

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  viewUrl: string;
  structuredContent: unknown;
}
