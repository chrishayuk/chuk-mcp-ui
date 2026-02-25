export interface WizardContent {
  type: "wizard";
  version: "1.0";
  title?: string;
  description?: string;
  steps: WizardStep[];
  initialValues?: Record<string, unknown>;
  submitTool: string;
  submitLabel?: string;
  /** Allow jumping to any completed step */
  allowNavigation?: boolean;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  /** JSON Schema fields for this step */
  fields: Record<string, WizardFieldSchema>;
  required?: string[];
  /** Only show this step when condition is met */
  condition?: StepCondition;
}

export interface WizardFieldSchema {
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
  widget?:
    | "text"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "slider"
    | "date"
    | "password"
    | "number";
  placeholder?: string;
  help?: string;
}

export interface StepCondition {
  /** Field name to check (from any previous step) */
  field: string;
  /** Operator */
  op: "eq" | "neq" | "in" | "gt" | "lt";
  /** Value to compare against */
  value: unknown;
}
