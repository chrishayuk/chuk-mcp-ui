export interface PivotValue {
  field: string;
  aggregate: "sum" | "count" | "avg" | "min" | "max";
  label?: string;
  format?: "number" | "percent" | "currency";
}

export interface PivotContent {
  type: "pivot";
  version: "1.0";
  title?: string;
  data: Record<string, unknown>[];
  rows: string[];
  columns: string[];
  values: PivotValue[];
  sortable?: boolean;
  showTotals?: boolean;
}
