import { useState, useCallback } from "react";
import { useView, Fallback, CSS_VARS } from "@chuk/view-shared";
import type {
  FormContent,
  FieldSchema,
  FieldUI,
  FieldGroup,
} from "./schema";

export function FormView() {
  const { data, content, callTool, isConnected } =
    useView<FormContent>("form", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <DynamicForm data={data} onCallTool={callTool} />;
}

interface DynamicFormProps {
  data: FormContent;
  onCallTool: (name: string, args: Record<string, unknown>) => Promise<void>;
}

function DynamicForm({ data, onCallTool }: DynamicFormProps) {
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
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        {title && <h2 style={styles.title}>{title}</h2>}
        {description && <p style={styles.description}>{description}</p>}

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

        <div style={styles.actions}>
          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? "Submitting..." : submitLabel ?? "Submit"}
          </button>
        </div>
      </form>
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
    <fieldset style={styles.fieldset}>
      <legend
        style={styles.legend}
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
    <div style={styles.field}>
      {widget !== "checkbox" && (
        <label htmlFor={fieldKey} style={styles.label}>
          {label}
          {required && <span style={styles.required}> *</span>}
        </label>
      )}

      {widget === "textarea" ? (
        <textarea
          id={fieldKey}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ui?.placeholder}
          disabled={ui?.disabled}
          readOnly={ui?.readonly}
          style={{ ...styles.input, minHeight: "80px", resize: "vertical" as const }}
        />
      ) : widget === "select" ? (
        <select
          id={fieldKey}
          value={String(value ?? "")}
          onChange={(e) => onChange(coerceValue(fieldSchema, e.target.value))}
          disabled={ui?.disabled}
          style={styles.input}
        >
          <option value="">{ui?.placeholder ?? "Select..."}</option>
          {fieldSchema.enum?.map((opt, i) => (
            <option key={String(opt)} value={String(opt)}>
              {fieldSchema.enumLabels?.[i] ?? String(opt)}
            </option>
          ))}
        </select>
      ) : widget === "radio" ? (
        <div style={styles.radioGroup}>
          {fieldSchema.enum?.map((opt, i) => (
            <label key={String(opt)} style={styles.radioLabel}>
              <input
                type="radio"
                name={fieldKey}
                value={String(opt)}
                checked={value === opt}
                onChange={() => onChange(opt)}
                disabled={ui?.disabled}
              />
              {fieldSchema.enumLabels?.[i] ?? String(opt)}
            </label>
          ))}
        </div>
      ) : widget === "checkbox" ? (
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            id={fieldKey}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={ui?.disabled}
          />
          {label}
          {required && <span style={styles.required}> *</span>}
        </label>
      ) : widget === "slider" ? (
        <div style={styles.sliderWrap}>
          <input
            type="range"
            id={fieldKey}
            min={fieldSchema.minimum ?? 0}
            max={fieldSchema.maximum ?? 100}
            value={Number(value ?? fieldSchema.minimum ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={ui?.disabled}
            style={{ flex: 1 }}
          />
          <span style={styles.sliderValue}>{String(value ?? 0)}</span>
        </div>
      ) : (
        <input
          type={widget === "number" ? "number" : widget === "password" ? "password" : widget === "date" ? "date" : widget === "datetime" ? "datetime-local" : widget === "color" ? "color" : "text"}
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
          style={styles.input}
        />
      )}

      {ui?.help && <p style={styles.help}>{ui.help}</p>}
      {error && <p style={styles.error}>{error}</p>}
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    overflow: "auto",
    fontFamily: `var(${CSS_VARS.fontFamily})`,
    color: `var(${CSS_VARS.colorText})`,
    backgroundColor: `var(${CSS_VARS.colorBackground})`,
  },
  form: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px",
  },
  title: { margin: "0 0 4px", fontSize: "18px", fontWeight: 600 },
  description: {
    margin: "0 0 20px",
    fontSize: "14px",
    color: `var(${CSS_VARS.colorTextSecondary})`,
  },
  field: { marginBottom: "16px" },
  label: {
    display: "block",
    marginBottom: "4px",
    fontSize: "14px",
    fontWeight: 500,
  },
  required: { color: "#e63946" },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid var(${CSS_VARS.colorBorder})`,
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    backgroundColor: `var(${CSS_VARS.colorSurface})`,
    color: `var(${CSS_VARS.colorText})`,
    fontSize: "14px",
    boxSizing: "border-box" as const,
  },
  radioGroup: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  radioLabel: { display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" },
  sliderWrap: { display: "flex", alignItems: "center", gap: "12px" },
  sliderValue: { fontSize: "14px", minWidth: "40px", textAlign: "right" as const },
  help: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: `var(${CSS_VARS.colorTextSecondary})`,
  },
  error: { margin: "4px 0 0", fontSize: "12px", color: "#e63946" },
  fieldset: {
    border: `1px solid var(${CSS_VARS.colorBorder})`,
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    padding: "16px",
    marginBottom: "16px",
  },
  legend: {
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none" as const,
  },
  actions: {
    marginTop: "24px",
    display: "flex",
    gap: "8px",
  },
  submitBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    backgroundColor: `var(${CSS_VARS.colorPrimary})`,
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
};
