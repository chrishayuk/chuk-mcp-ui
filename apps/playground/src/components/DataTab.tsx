import { useCallback } from "react";
import { namedSamples, type ViewType } from "../samples";
import { JsonEditor } from "./JsonEditor";
import { CopyButton } from "./CopyButton";

interface DataTabProps {
  viewType: ViewType;
  jsonText: string;
  jsonError: string | null;
  onChange: (text: string) => void;
}

export function DataTab({ viewType, jsonText, jsonError, onChange }: DataTabProps) {
  const datasets = namedSamples[viewType] ?? {};
  const datasetNames = Object.keys(datasets);

  const loadDataset = useCallback(
    (name: string) => {
      const data = datasets[name];
      if (data) onChange(JSON.stringify(data, null, 2));
    },
    [datasets, onChange],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-muted/30">
        {datasetNames.length > 1 && (
          <select
            onChange={(e) => loadDataset(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-background text-foreground text-xs"
          >
            {datasetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
        <div className="flex-1" />
        <CopyButton jsonText={jsonText} />
      </div>
      <JsonEditor value={jsonText} onChange={onChange} error={jsonError} />
    </div>
  );
}
