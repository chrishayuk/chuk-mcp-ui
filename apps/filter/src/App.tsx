import { useState, useCallback, useMemo } from "react";
import { useView, useViewFilter } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Checkbox,
  Slider,
  Badge,
  Label,
  cn,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type {
  FilterContent,
  FilterField,
  FilterOption,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View (wired to MCP + cross-view bus)                              */
/* ------------------------------------------------------------------ */

export function FilterView() {
  const { data } =
    useView<FilterContent>("filter", "1.0");

  const { setFilter, clearAll } = useViewFilter();

  if (!data) return null;

  return (
    <FilterRenderer
      data={data}
      onFilterChange={(values) => {
        for (const [field, value] of Object.entries(values)) {
          setFilter(field, value);
        }
      }}
      onReset={clearAll}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export interface FilterRendererProps {
  data: FilterContent;
  onFilterChange?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
}

export function FilterRenderer({
  data,
  onFilterChange,
  onReset,
}: FilterRendererProps) {
  const {
    title,
    filters,
    layout = "horizontal",
    submitMode = "instant",
    resetLabel = "Reset",
  } = data;

  /* Build initial values from defaultValue on each filter */
  const initialValues = useMemo(() => {
    const map: Record<string, unknown> = {};
    for (const field of filters) {
      map[field.id] = field.defaultValue ?? getFieldDefault(field);
    }
    return map;
  }, [filters]);

  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  /* Pending values for button-submit mode */
  const [pendingValues, setPendingValues] =
    useState<Record<string, unknown>>(initialValues);

  const isInstant = submitMode === "instant";

  const handleChange = useCallback(
    (fieldId: string, newValue: unknown) => {
      if (isInstant) {
        setValues((prev) => {
          const next = { ...prev, [fieldId]: newValue };
          onFilterChange?.(next);
          return next;
        });
      } else {
        setPendingValues((prev) => ({ ...prev, [fieldId]: newValue }));
      }
    },
    [isInstant, onFilterChange],
  );

  const handleApply = useCallback(() => {
    setValues(pendingValues);
    onFilterChange?.(pendingValues);
  }, [pendingValues, onFilterChange]);

  const handleReset = useCallback(() => {
    setValues(initialValues);
    setPendingValues(initialValues);
    onReset?.();
  }, [initialValues, onReset]);

  const activeValues = isInstant ? values : pendingValues;

  const layoutClass = cn(
    "gap-4",
    layout === "horizontal" && "flex flex-row items-end",
    layout === "vertical" && "flex flex-col",
    layout === "wrap" && "flex flex-row flex-wrap items-end",
  );

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full font-sans text-foreground bg-background p-4"
    >
      <Card>
        <CardContent className="pt-6">
          {title && (
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
          )}

          <div className={layoutClass}>
            {filters.map((field) => (
              <FilterFieldControl
                key={field.id}
                field={field}
                value={activeValues[field.id]}
                onChange={(v) => handleChange(field.id, v)}
              />
            ))}

            {/* Action buttons */}
            <div className="flex items-end gap-2 flex-shrink-0">
              {!isInstant && (
                <Button onClick={handleApply} size="sm">
                  Apply
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                {resetLabel}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field Controls                                                    */
/* ------------------------------------------------------------------ */

function FilterFieldControl({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <Label className="text-sm font-medium">{field.label}</Label>
      <FieldWidget field={field} value={value} onChange={onChange} />
    </div>
  );
}

function FieldWidget({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case "text":
      return (
        <Input
          type="text"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      );

    case "select":
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={field.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {opt.label}
                  {opt.count != null && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {opt.count}
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "multi-select":
      return (
        <MultiSelectControl
          options={field.options ?? []}
          value={asStringArray(value)}
          onChange={onChange}
        />
      );

    case "date-range":
      return (
        <DateRangeControl
          value={asDateRange(value)}
          onChange={onChange}
        />
      );

    case "number-range":
      return (
        <NumberRangeControl
          field={field}
          value={asNumberRange(value)}
          onChange={onChange}
        />
      );

    case "toggle":
      return (
        <div className="flex items-center h-9">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(Boolean(checked))}
          />
        </div>
      );

    case "checkbox-group":
      return (
        <CheckboxGroupControl
          options={field.options ?? []}
          value={asStringArray(value)}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Multi-Select                                                      */
/* ------------------------------------------------------------------ */

function MultiSelectControl({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string[];
  onChange: (value: unknown) => void;
}) {
  const toggle = (optValue: string) => {
    const next = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2 text-sm cursor-pointer"
        >
          <Checkbox
            checked={value.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
          />
          <span>{opt.label}</span>
          {opt.count != null && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {opt.count}
            </Badge>
          )}
        </label>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Date Range                                                        */
/* ------------------------------------------------------------------ */

function DateRangeControl({
  value,
  onChange,
}: {
  value: { from: string; to: string };
  onChange: (value: unknown) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className="h-9"
      />
      <span className="text-muted-foreground text-sm">to</span>
      <Input
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className="h-9"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Number Range                                                      */
/* ------------------------------------------------------------------ */

function NumberRangeControl({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: { from: number | ""; to: number | "" };
  onChange: (value: unknown) => void;
}) {
  const hasMinMax = field.min != null && field.max != null;

  if (hasMinMax) {
    const fromVal = typeof value.from === "number" ? value.from : field.min!;
    const toVal = typeof value.to === "number" ? value.to : field.max!;

    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <Slider
          min={field.min}
          max={field.max}
          value={[fromVal, toVal]}
          onValueChange={([f, t]) => onChange({ from: f, to: t })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{fromVal}</span>
          <span>{toVal}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value.from === "" ? "" : String(value.from)}
        placeholder={field.placeholder ?? "Min"}
        onChange={(e) =>
          onChange({
            ...value,
            from: e.target.value === "" ? "" : Number(e.target.value),
          })
        }
        min={field.min}
        max={field.max}
        className="h-9 w-[90px]"
      />
      <span className="text-muted-foreground text-sm">to</span>
      <Input
        type="number"
        value={value.to === "" ? "" : String(value.to)}
        placeholder="Max"
        onChange={(e) =>
          onChange({
            ...value,
            to: e.target.value === "" ? "" : Number(e.target.value),
          })
        }
        min={field.min}
        max={field.max}
        className="h-9 w-[90px]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkbox Group                                                    */
/* ------------------------------------------------------------------ */

function CheckboxGroupControl({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string[];
  onChange: (value: unknown) => void;
}) {
  const toggle = (optValue: string) => {
    const next = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2 text-sm cursor-pointer"
        >
          <Checkbox
            checked={value.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
          />
          <span>{opt.label}</span>
          {opt.count != null && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {opt.count}
            </Badge>
          )}
        </label>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getFieldDefault(field: FilterField): unknown {
  switch (field.type) {
    case "text":
      return "";
    case "select":
      return "";
    case "multi-select":
      return [];
    case "date-range":
      return { from: "", to: "" };
    case "number-range":
      return { from: "", to: "" };
    case "toggle":
      return false;
    case "checkbox-group":
      return [];
    default:
      return "";
  }
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

function asDateRange(value: unknown): { from: string; to: string } {
  if (
    value &&
    typeof value === "object" &&
    "from" in value &&
    "to" in value
  ) {
    return {
      from: String((value as Record<string, unknown>).from ?? ""),
      to: String((value as Record<string, unknown>).to ?? ""),
    };
  }
  return { from: "", to: "" };
}

function asNumberRange(
  value: unknown,
): { from: number | ""; to: number | "" } {
  if (
    value &&
    typeof value === "object" &&
    "from" in value &&
    "to" in value
  ) {
    const raw = value as Record<string, unknown>;
    return {
      from: typeof raw.from === "number" ? raw.from : "",
      to: typeof raw.to === "number" ? raw.to : "",
    };
  }
  return { from: "", to: "" };
}
