import { Badge } from "@chuk/view-ui";
import { ViewThumbnail } from "./ViewThumbnail";
import type { ViewEntry } from "../catalogue-registry";

interface ViewCardProps {
  entry: ViewEntry;
  sampleData: object;
  onClick: (name: string) => void;
  theme?: "light" | "dark";
}

export function ViewCard({ entry, sampleData, onClick, theme = "light" }: ViewCardProps) {
  return (
    <button
      onClick={() => onClick(entry.name)}
      className="group flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 transition-all text-left cursor-pointer"
    >
      <ViewThumbnail viewType={entry.name} data={sampleData} theme={theme} />
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
            {entry.displayName}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {entry.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {entry.description}
        </p>
      </div>
    </button>
  );
}
