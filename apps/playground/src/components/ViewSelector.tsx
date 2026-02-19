import { VIEW_TYPES, type ViewType } from "../samples";

interface ViewSelectorProps {
  value: ViewType;
  onChange: (view: ViewType) => void;
}

export function ViewSelector({ value, onChange }: ViewSelectorProps) {
  return (
    <div className="px-3 py-2 border-b border-border flex items-center gap-2">
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        View Type
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ViewType)}
        className="px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
      >
        {VIEW_TYPES.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}
