import { useState, useCallback } from "react";
import { useView, useViewEvents } from "@chuk/view-shared";
import { motion } from "framer-motion";
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
} from "@chuk/view-ui";
import type { FormContent, FieldSchema, FieldUI, FieldGroup } from "./schema";

export function FormView() {
  const { data, callTool } =
    useView<FormContent>("form", "1.0");

  if (!data) return null;

  return <DynamicForm data={data} onCallTool={callTool} />;
}

export interface DynamicFormProps {
  data: FormContent;
  onCallTool: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function DynamicForm({ data, onCallTool }: DynamicFormProps) {
  const { emitSubmit } = useViewEvents();
  const { schema, uiSchema, initialValues, submitTool, submitLabel, title, description } = data;
  const [values, setValues] = useState<Record<string, unknown>>(
    () => initialValues ?? buildDefaults(schema)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(schema, values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setSubmitting(true);
      try {
        emitSubmit(values, submitTool);
        await onCallTool(submitTool, values);
      } finally {
        setSubmitting(false);
      }
    },
    [schema, values, submitTool, onCallTool]
  );

  const fieldOrder = uiSchema?.order ?? Object.keys(schema.properties);
  const groups = uiSchema?.groups;

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.form
        onSubmit={handleSubmit}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[600px] mx-auto p-6"
      >
        {title && <h2 className="mb-1 text-lg font-semibold">{title}</h2>}
        {description && <p className="mb-5 text-sm text-muted-foreground">{description}</p>}

        {groups ? (
          groups.map((group) => (
            <FieldGroupSection
              key={group.title}
              group={group}
              schema={schema}
              uiSchema={uiSchema}
              values={values}
              errors={errors}
              onChange={setValue}
            />
          ))
        ) : (
          fieldOrder.map((key) => (
            <FieldRenderer
              key={key}
              fieldKey={key}
              fieldSchema={schema.properties[key]}
              ui={uiSchema?.fields?.[key]}
              value={values[key]}
              error={errors[key]}
              required={schema.required?.includes(key)}
              onChange={(v) => setValue(key, v)}
            />
          ))
        )}

        <div className="mt-6 flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : submitLabel ?? "Submit"}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}

function FieldGroupSection({
  group,
  schema,
  uiSchema,
  values,
  errors,
  onChange,
}: {
  group: FieldGroup;
  schema: FormContent["schema"];
  uiSchema?: FormContent["uiSchema"];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
}) {
  const [collapsed, setCollapsed] = useState(group.collapsed ?? false);

  return (
    <fieldset className="border border-border rounded-lg p-4 mb-4">
      <legend
        className="text-sm font-semibold cursor-pointer select-none px-1"
        onClick={() => group.collapsible && setCollapsed((c) => !c)}
      >
        {group.collapsible && (collapsed ? "\u25b6 " : "\u25bc ")}
        {group.title}
      </legend>
      {!collapsed &&
        group.fields.map((key) => (
          <FieldRenderer
            key={key}
            fieldKey={key}
            fieldSchema={schema.properties[key]}
            ui={uiSchema?.fields?.[key]}
            value={values[key]}
            error={errors[key]}
            required={schema.required?.includes(key)}
            onChange={(v) => onChange(key, v)}
          />
        ))}
    </fieldset>
  );
}

function FieldRenderer({
  fieldKey,
  fieldSchema,
  ui,
  value,
  error,
  required,
  onChange,
}: {
  fieldKey: string;
  fieldSchema: FieldSchema;
  ui?: FieldUI;
  value: unknown;
  error?: string;
  required?: boolean;
  onChange: (value: unknown) => void;
}) {
  if (ui?.widget === "hidden") return null;

  const label = fieldSchema.title ?? fieldKey;
  const widget = ui?.widget ?? inferWidget(fieldSchema);

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
          placeholder={ui?.placeholder}
          disabled={ui?.disabled}
          readOnly={ui?.readonly}
          className="min-h-[80px] resize-y"
        />
      ) : widget === "select" ? (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(coerceValue(fieldSchema, v))}
          disabled={ui?.disabled}
        >
          <SelectTrigger id={fieldKey}>
            <SelectValue placeholder={ui?.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {fieldSchema.enum?.map((opt, i) => (
              <SelectItem key={String(opt)} value={String(opt)}>
                {fieldSchema.enumLabels?.[i] ?? String(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : widget === "radio" ? (
        <RadioGroup
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          disabled={ui?.disabled}
        >
          {fieldSchema.enum?.map((opt, i) => (
            <div key={String(opt)} className="flex items-center gap-2">
              <RadioGroupItem value={String(opt)} id={`${fieldKey}-${opt}`} />
              <Label htmlFor={`${fieldKey}-${opt}`} className="font-normal">
                {fieldSchema.enumLabels?.[i] ?? String(opt)}
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
            disabled={ui?.disabled}
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
            min={fieldSchema.minimum ?? 0}
            max={fieldSchema.maximum ?? 100}
            value={[Number(value ?? fieldSchema.minimum ?? 0)]}
            onValueChange={([v]) => onChange(v)}
            disabled={ui?.disabled}
            className="flex-1"
          />
          <span className="text-sm min-w-[40px] text-right">{String(value ?? 0)}</span>
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
                  : widget === "datetime"
                    ? "datetime-local"
                    : widget === "color"
                      ? "color"
                      : "text"
          }
          id={fieldKey}
          value={String(value ?? "")}
          onChange={(e) =>
            onChange(
              widget === "number"
                ? e.target.value === "" ? "" : Number(e.target.value)
                : e.target.value
            )
          }
          placeholder={ui?.placeholder}
          disabled={ui?.disabled}
          readOnly={ui?.readonly}
          min={fieldSchema.minimum}
          max={fieldSchema.maximum}
        />
      )}

      {ui?.help && <p className="mt-1 text-xs text-muted-foreground">{ui.help}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inferWidget(schema: FieldSchema): string {
  if (schema.type === "boolean") return "checkbox";
  if (schema.enum) return schema.enum.length <= 4 ? "radio" : "select";
  if (schema.type === "number" || schema.type === "integer") return "number";
  return "text";
}

function coerceValue(schema: FieldSchema, raw: string): unknown {
  if (schema.type === "number" || schema.type === "integer") return Number(raw);
  return raw;
}

function buildDefaults(schema: FormContent["schema"]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema.properties)) {
    if (field.default !== undefined) defaults[key] = field.default;
    else if (field.type === "boolean") defaults[key] = false;
    else defaults[key] = "";
  }
  return defaults;
}

function validate(
  schema: FormContent["schema"],
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of schema.required ?? []) {
    const v = values[key];
    if (v === undefined || v === null || v === "") {
      errors[key] = "This field is required.";
    }
  }
  for (const [key, field] of Object.entries(schema.properties)) {
    const v = values[key];
    if (v === undefined || v === null || v === "") continue;
    if (
      (field.type === "number" || field.type === "integer") &&
      typeof v === "number"
    ) {
      if (field.minimum !== undefined && v < field.minimum)
        errors[key] = `Minimum value is ${field.minimum}.`;
      if (field.maximum !== undefined && v > field.maximum)
        errors[key] = `Maximum value is ${field.maximum}.`;
    }
    if (field.type === "string" && typeof v === "string") {
      if (field.minLength !== undefined && v.length < field.minLength)
        errors[key] = `Minimum length is ${field.minLength}.`;
      if (field.maxLength !== undefined && v.length > field.maxLength)
        errors[key] = `Maximum length is ${field.maxLength}.`;
      if (field.pattern && !new RegExp(field.pattern).test(v))
        errors[key] = `Invalid format.`;
    }
  }
  return errors;
}
