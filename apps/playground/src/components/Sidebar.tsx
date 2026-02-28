import { useRef, useState, useEffect } from "react";
import { Input, Badge } from "@chuk/view-ui";
import { CATEGORIES, type Category } from "../catalogue-registry";
import type { CatalogueFilter } from "../hooks/useCatalogueFilter";

interface SidebarProps {
  filter: CatalogueFilter;
  categoryCounts: Map<Category, number>;
}

export function Sidebar({ filter, categoryCounts }: SidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  // Local input state for controlled component; debounced to filter.setSearchQuery
  const [localQuery, setLocalQuery] = useState(filter.searchQuery);

  // Focus search on mount + clean up debounce on unmount
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync local state when filter is cleared externally
  useEffect(() => {
    if (filter.searchQuery === "" && localQuery !== "") {
      setLocalQuery("");
    }
  }, [filter.searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchInput = (value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      filter.setSearchQuery(value);
    }, 200);
  };

  const hasFilters =
    filter.searchQuery.length > 0 || filter.selectedCategories.size > 0;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-muted/30 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <Input
          ref={inputRef}
          placeholder="Search views..."
          value={localQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="text-sm"
          aria-label="Search views"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Categories
          </span>
          {hasFilters && (
            <button
              onClick={filter.clearFilters}
              className="text-xs text-primary hover:underline"
              aria-label="Clear all filters"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1" role="listbox" aria-label="Category filters">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts.get(cat) ?? 0;
            const active = filter.selectedCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => filter.toggleCategory(cat)}
                role="option"
                aria-selected={active}
                className={`flex items-center justify-between px-2 py-1.5 rounded text-sm text-left transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="truncate">{cat}</span>
                <Badge
                  variant={active ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0 ml-2 shrink-0"
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground" aria-live="polite">
        {filter.filteredViews.length} view{filter.filteredViews.length !== 1 ? "s" : ""}
      </div>
    </aside>
  );
}
