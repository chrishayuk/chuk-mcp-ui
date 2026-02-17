export interface FormContent {
  type: "form";
  version: "1.0";
  title?: string;
  description?: string;
  schema: JSONSchemaField;
  uiSchema?: UISchema;
  initialValues?: Record<string, unknown>;
  submitTool: string;
  submitLabel?: string;
  cancelable?: boolean;
  layout?: "vertical" | "horizontal";
}

export interface JSONSchemaField {
  type: "object";
  required?: string[];
  properties: Record<string, FieldSchema>;
}

export interface FieldSchema {
  type: "string" | "number" | "integer" | "boolean";
  title?: string;
  description?: string;
  default?: unknown;
  enum?: (string | number)[];
  enumLabels?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface UISchema {
  order?: string[];
  fields?: Record<string, FieldUI>;
  groups?: FieldGroup[];
}

export interface FieldUI {
  widget?:
    | "text"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "slider"
    | "date"
    | "datetime"
    | "color"
    | "password"
    | "hidden"
    | "number";
  placeholder?: string;
  help?: string;
  disabled?: boolean;
  readonly?: boolean;
}

export interface FieldGroup {
  title: string;
  fields: string[];
  collapsible?: boolean;
  collapsed?: boolean;
}
