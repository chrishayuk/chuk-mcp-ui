export interface FilterContent {
  type: "filter";
  version: "1.0";
  title?: string;
  filters: FilterField[];
  layout?: "horizontal" | "vertical" | "wrap";
  submitMode?: "instant" | "button";
  resetLabel?: string;
}

export interface FilterField {
  id: string;
  label: string;
  type:
    | "text"
    | "select"
    | "multi-select"
    | "date-range"
    | "number-range"
    | "toggle"
    | "checkbox-group";
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  defaultValue?: unknown;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
