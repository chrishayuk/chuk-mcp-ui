import { ViewCard } from "./ViewCard";
import { samples, type ViewType } from "../samples";
import type { ViewEntry } from "../catalogue-registry";

interface CatalogueGridProps {
  views: ViewEntry[];
  onSelectView: (name: string) => void;
  theme?: "light" | "dark";
}

export function CatalogueGrid({ views, onSelectView, theme = "light" }: CatalogueGridProps) {
  if (views.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No views match your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
      {views.map((entry) => (
        <ViewCard
          key={entry.name}
          entry={entry}
          sampleData={samples[entry.name as ViewType] ?? {}}
          onClick={onSelectView}
          theme={theme}
        />
      ))}
    </div>
  );
}
