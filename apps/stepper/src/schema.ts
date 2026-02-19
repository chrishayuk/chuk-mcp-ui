export interface StepperContent {
  type: "stepper";
  version: "1.0";
  title?: string;
  steps: Step[];
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  allowNavigation?: boolean;
  stepTool?: string;
}

export interface Step {
  id: string;
  label: string;
  description?: string;
  status?: "pending" | "active" | "completed" | "error" | "skipped";
  icon?: string;
  detail?: string;
}
