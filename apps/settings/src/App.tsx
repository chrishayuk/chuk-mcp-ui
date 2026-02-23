import { useState, useCallback, useMemo, useRef } from "react";
import { useView } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Separator,
  ScrollArea,
  cn,
} from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, collapseExpand, listContainer, listItem } from "@chuk/view-ui/animations";
import type {
  SettingsContent,
  SettingsSection,
  SettingsField,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                               */
/* ------------------------------------------------------------------ */

export function SettingsView() {
  const { data, callTool } =
    useView<SettingsContent>("settings", "1.0");

  if (!data) return null;

  return <SettingsRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export interface SettingsRendererProps {
  data: SettingsContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function SettingsRenderer({ data, onCallTool }: SettingsRendererProps) {
  const { title, sections, saveTool, autoSave } = data;

  /* Build initial values map from all fields */
  const initialValues = useMemo(() => {
    const map: Record<string, unknown> = {};
    for (const section of sections) {
      for (const field of section.fields) {
        map[field.id] = field.value;
      }
    }
    return map;
  }, [sections]);

  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [saving, setSaving] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = useMemo(() => {
    for (const key of Object.keys(initialValues)) {
      if (values[key] !== initialValues[key]) return true;
    }
    return false;
  }, [values, initialValues]);

  /* Collapsed state per section */
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      for (const section of sections) {
        if (section.collapsible) {
          map[section.id] = section.collapsed ?? false;
        }
      }
      return map;
    },
  );

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  /* Auto-save helper */
  const triggerAutoSave = useCallback(
    (nextValues: Record<string, unknown>) => {
      if (!autoSave || !saveTool) return;
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(async () => {
        if (onCallTool) {
          await onCallTool(saveTool, nextValues);
        }
      }, 500);
    },
    [autoSave, saveTool, onCallTool],
  );

  const handleChange = useCallback(
    (fieldId: string, newValue: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [fieldId]: newValue };
        triggerAutoSave(next);
        return next;
      });
    },
    [triggerAutoSave],
  );

  /* Save / Reset */
  const handleSave = useCallback(async () => {
    if (!saveTool) return;
    setSaving(true);
    try {
      if (onCallTool) {
        await onCallTool(saveTool, values);
      }
    } finally {
      setSaving(false);
    }
  }, [saveTool, values, onCallTool]);

  const handleReset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Header */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="px-6 pt-6 pb-2 flex-shrink-0"
      >
        {title && (
          <h1 className="text-xl font-semibold leading-tight">{title}</h1>
        )}
      </motion.div>

      {/* Scrollable sections */}
      <ScrollArea className="flex-1">
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="visible"
          className="px-6 pb-6 space-y-4 max-w-[640px]"
        >
          {sections.map((section) => (
            <motion.div key={section.id} variants={listItem}>
              <SectionCard
                section={section}
                values={values}
                collapsed={collapsedMap[section.id] ?? false}
                onToggleCollapse={() => toggleSection(section.id)}
                onChange={handleChange}
              />
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>

      {/* Footer with Save/Reset (unless autoSave) */}
      {!autoSave && (
        <div className="flex-shrink-0 border-t border-border px-6 py-4">
          <div className="flex items-center gap-3 max-w-[640px]">
            <Button
              onClick={handleSave}
              disabled={!isDirty || saving || !saveTool}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!isDirty}
            >
              Reset
            </Button>
            {isDirty && (
              <span className="text-xs text-muted-foreground ml-auto">
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Card                                                      */
/* ------------------------------------------------------------------ */

function SectionCard({
  section,
  values,
  collapsed,
  onToggleCollapse,
  onChange,
}: {
  section: SettingsSection;
  values: Record<string, unknown>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (fieldId: string, value: unknown) => void;
}) {
  return (
    <Card>
      <CardHeader
        className={cn(
          section.collapsible && "cursor-pointer select-none",
        )}
        onClick={section.collapsible ? onToggleCollapse : undefined}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{section.title}</CardTitle>
          {section.collapsible && (
            <span className="text-muted-foreground text-sm">
              {collapsed ? "\u25b6" : "\u25bc"}
            </span>
          )}
        </div>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            variants={collapseExpand}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <CardContent>
              <div className="space-y-4">
                {section.fields.map((field, i) => (
                  <div key={field.id}>
                    {i > 0 && <Separator className="mb-4" />}
                    <FieldRow
                      field={field}
                      value={values[field.id]}
                      onChange={(v) => onChange(field.id, v)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Field Row                                                         */
/* ------------------------------------------------------------------ */

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: SettingsField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: label + description */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{field.label}</div>
        {field.description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {field.description}
          </div>
        )}
      </div>

      {/* Right: control */}
      <div className="flex-shrink-0">
        <FieldControl field={field} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field Control                                                     */
/* ------------------------------------------------------------------ */

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: SettingsField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case "toggle":
      return (
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
          disabled={field.disabled}
        />
      );

    case "select":
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          disabled={field.disabled}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "text":
      return (
        <Input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.disabled}
          className="w-[180px]"
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={String(value ?? "")}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          min={field.min}
          max={field.max}
          step={field.step}
          disabled={field.disabled}
          className="w-[100px]"
        />
      );

    case "slider":
      return (
        <div className="flex items-center gap-3 w-[200px]">
          <Slider
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            value={[Number(value ?? field.min ?? 0)]}
            onValueChange={([v]) => onChange(v)}
            disabled={field.disabled}
            className="flex-1"
          />
          <span className="text-sm tabular-nums min-w-[32px] text-right text-muted-foreground">
            {String(value ?? 0)}
          </span>
        </div>
      );

    case "radio":
      return (
        <RadioGroup
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
          disabled={field.disabled}
          className="flex gap-3"
        >
          {field.options?.map((opt) => (
            <div key={opt.value} className="flex items-center gap-1.5">
              <RadioGroupItem
                value={opt.value}
                id={`${field.id}-${opt.value}`}
              />
              <label
                htmlFor={`${field.id}-${opt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {opt.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      );

    case "color":
      return (
        <input
          type="color"
          value={String(value ?? "#000000")}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.disabled}
          className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
        />
      );

    default:
      return null;
  }
}
