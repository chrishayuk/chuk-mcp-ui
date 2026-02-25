import { useState, useCallback, useMemo } from "react";
import { useView, useViewEvents } from "@chuk/view-shared";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import {
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  cn,
} from "@chuk/view-ui";
import type {
  WizardContent,
  WizardStep,
  WizardFieldSchema,
  StepCondition,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View (connected)                                                   */
/* ------------------------------------------------------------------ */

export function WizardView() {
  const { data, callTool, sendMessage } =
    useView<WizardContent>("wizard", "1.0");

  if (!data) return null;

  return (
    <WizardRenderer
      data={data}
      onCallTool={callTool}
      onSendMessage={sendMessage}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface WizardRendererProps {
  data: WizardContent;
  onCallTool?: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<void>;
  onSendMessage?: (params: {
    role: string;
    content: Array<{ type: string; text: string }>;
  }) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Main renderer                                                      */
/* ------------------------------------------------------------------ */

export function WizardRenderer({
  data,
  onCallTool,
  onSendMessage,
}: WizardRendererProps) {
  const { emitSubmit } = useViewEvents();
  const {
    steps,
    initialValues,
    submitTool,
    submitLabel,
    title,
    description,
    allowNavigation,
  } = data;

  const [values, setValues] = useState<Record<string, unknown>>(
    () => initialValues ?? {},
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter steps based on conditions
  const visibleSteps = useMemo(() => {
    return steps.filter((step) => {
      if (!step.condition) return true;
      return evaluateCondition(step.condition, values);
    });
  }, [steps, values]);

  const activeStep = visibleSteps[currentStep];
  const isLastStep = currentStep === visibleSteps.length - 1;

  const setValue = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (step: WizardStep): Record<string, string> => {
      const errs: Record<string, string> = {};
      for (const key of step.required ?? []) {
        const v = values[key];
        if (v === undefined || v === null || v === "") {
          errs[key] = "This field is required.";
        }
      }
      for (const [key, field] of Object.entries(step.fields)) {
        const v = values[key];
        if (v === undefined || v === null || v === "") continue;
        if (
          (field.type === "number" || field.type === "integer") &&
          typeof v === "number"
        ) {
          if (field.minimum !== undefined && v < field.minimum)
            errs[key] = `Minimum value is ${field.minimum}.`;
          if (field.maximum !== undefined && v > field.maximum)
            errs[key] = `Maximum value is ${field.maximum}.`;
        }
        if (field.type === "string" && typeof v === "string") {
          if (field.minLength !== undefined && v.length < field.minLength)
            errs[key] = `Minimum length is ${field.minLength}.`;
          if (field.maxLength !== undefined && v.length > field.maxLength)
            errs[key] = `Maximum length is ${field.maxLength}.`;
          if (field.pattern && !new RegExp(field.pattern).test(v))
            errs[key] = "Invalid format.";
        }
      }
      return errs;
    },
    [values],
  );

  const handleNext = useCallback(() => {
    if (!activeStep) return;
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, visibleSteps.length - 1));
  }, [activeStep, validateStep, visibleSteps.length]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activeStep) return;
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setSubmitting(true);
    try {
      emitSubmit(values, submitTool);
      if (onCallTool) await onCallTool(submitTool, values);
      if (onSendMessage) {
        const summary = Object.entries(values)
          .filter(([, v]) => v !== "" && v !== undefined && v !== null)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join(", ");
        await onSendMessage({
          role: "user",
          content: [
            {
              type: "text",
              text: `User completed wizard "${title ?? submitTool}": ${summary}`,
            },
          ],
        });
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    activeStep,
    validateStep,
    values,
    submitTool,
    onCallTool,
    onSendMessage,
    title,
    emitSubmit,
  ]);

  const handleStepClick = useCallback(
    (idx: number) => {
      if (!allowNavigation) return;
      if (idx < currentStep) setCurrentStep(idx);
    },
    [allowNavigation, currentStep],
  );

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[640px] mx-auto p-6"
      >
        {title && <h2 className="mb-1 text-lg font-semibold">{title}</h2>}
        {description && (
          <p className="mb-5 text-sm text-muted-foreground">{description}</p>
        )}

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-6">
          {visibleSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-1 flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(idx)}
                disabled={!allowNavigation || idx >= currentStep}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center shrink-0 transition-colors",
                  idx < currentStep &&
                    "bg-primary text-primary-foreground",
                  idx === currentStep &&
                    "bg-primary text-primary-foreground ring-2 ring-primary/30",
                  idx > currentStep &&
                    "bg-muted text-muted-foreground",
                  allowNavigation &&
                    idx < currentStep &&
                    "cursor-pointer hover:ring-2 hover:ring-primary/30",
                )}
              >
                {idx < currentStep ? "\u2713" : idx + 1}
              </button>
              {idx < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded",
                    idx < currentStep ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step */}
        <AnimatePresence mode="wait">
          {activeStep && (
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-base font-medium mb-1">
                {activeStep.title}
              </h3>
              {activeStep.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {activeStep.description}
                </p>
              )}

              {Object.entries(activeStep.fields).map(([key, field]) => (
                <FieldRenderer
                  key={key}
                  fieldKey={key}
                  field={field}
                  value={values[key]}
                  error={errors[key]}
                  required={activeStep.required?.includes(key)}
                  onChange={(v) => setValue(key, v)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : submitLabel ?? "Submit"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>

        {/* Step counter */}
        <p className="mt-3 text-xs text-center text-muted-foreground">
          Step {currentStep + 1} of {visibleSteps.length}
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field Renderer                                                     */
/* ------------------------------------------------------------------ */

function FieldRenderer({
  fieldKey,
  field,
  value,
  error,
  required,
  onChange,
}: {
  fieldKey: string;
  field: WizardFieldSchema;
  value: unknown;
  error?: string;
  required?: boolean;
  onChange: (v: unknown) => void;
}) {
  const label = field.title ?? fieldKey;
  const widget = field.widget ?? inferWidget(field);

  return (
    <div className="mb-4">
      {widget !== "checkbox" && (
        <Label htmlFor={fieldKey}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}

      {widget === "textarea" ? (
        <Textarea
          id={fieldKey}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="min-h-[80px] resize-y"
        />
      ) : widget === "select" ? (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(coerce(field, v))}
        >
          <SelectTrigger id={fieldKey}>
            <SelectValue placeholder={field.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {field.enum?.map((opt, i) => (
              <SelectItem key={String(opt)} value={String(opt)}>
                {field.enumLabels?.[i] ?? String(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : widget === "radio" ? (
        <RadioGroup
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
        >
          {field.enum?.map((opt, i) => (
            <div key={String(opt)} className="flex items-center gap-2">
              <RadioGroupItem
                value={String(opt)}
                id={`${fieldKey}-${opt}`}
              />
              <Label
                htmlFor={`${fieldKey}-${opt}`}
                className="font-normal"
              >
                {field.enumLabels?.[i] ?? String(opt)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : widget === "checkbox" ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id={fieldKey}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <Label htmlFor={fieldKey} className="font-normal">
            {label}
            {required && <span className="text-destructive"> *</span>}
          </Label>
        </div>
      ) : widget === "slider" ? (
        <div className="flex items-center gap-3">
          <Slider
            id={fieldKey}
            min={field.minimum ?? 0}
            max={field.maximum ?? 100}
            value={[Number(value ?? field.minimum ?? 0)]}
            onValueChange={([v]) => onChange(v)}
            className="flex-1"
          />
          <span className="text-sm min-w-[40px] text-right">
            {String(value ?? 0)}
          </span>
        </div>
      ) : (
        <Input
          type={
            widget === "number"
              ? "number"
              : widget === "password"
                ? "password"
                : widget === "date"
                  ? "date"
                  : "text"
          }
          id={fieldKey}
          value={String(value ?? "")}
          onChange={(e) =>
            onChange(
              widget === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value,
            )
          }
          placeholder={field.placeholder}
          min={field.minimum}
          max={field.maximum}
        />
      )}

      {field.help && (
        <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function inferWidget(field: WizardFieldSchema): string {
  if (field.type === "boolean") return "checkbox";
  if (field.enum) return field.enum.length <= 4 ? "radio" : "select";
  if (field.type === "number" || field.type === "integer") return "number";
  return "text";
}

function coerce(field: WizardFieldSchema, raw: string): unknown {
  if (field.type === "number" || field.type === "integer") return Number(raw);
  return raw;
}

function evaluateCondition(
  cond: StepCondition,
  values: Record<string, unknown>,
): boolean {
  const v = values[cond.field];
  switch (cond.op) {
    case "eq":
      return v === cond.value;
    case "neq":
      return v !== cond.value;
    case "in":
      return Array.isArray(cond.value) && cond.value.includes(v);
    case "gt":
      return (
        typeof v === "number" &&
        typeof cond.value === "number" &&
        v > cond.value
      );
    case "lt":
      return (
        typeof v === "number" &&
        typeof cond.value === "number" &&
        v < cond.value
      );
    default:
      return true;
  }
}
