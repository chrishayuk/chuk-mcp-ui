import { useMemo, useState, useCallback } from "react";
import { registry, type Category, type ViewEntry } from "../catalogue-registry";

export interface CatalogueFilter {
  searchQuery: string;
  selectedCategories: Set<Category>;
  filteredViews: ViewEntry[];
  setSearchQuery: (q: string) => void;
  toggleCategory: (cat: Category) => void;
  clearFilters: () => void;
}

function matchesSearch(entry: ViewEntry, query: string): number {
  const q = query.toLowerCase();

  // Exact name match — highest priority
  if (entry.name === q) return 3;

  // Name contains
  if (entry.name.includes(q) || entry.displayName.toLowerCase().includes(q)) return 2;

  // Description or tags match
  if (
    entry.description.toLowerCase().includes(q) ||
    entry.category.toLowerCase().includes(q) ||
    entry.tags.some((t) => t.includes(q))
  ) {
    return 1;
  }

  return 0;
}

export function useCatalogueFilter(): CatalogueFilter {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(),
  );

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories(new Set());
  }, []);

  const filteredViews = useMemo(() => {
    let views = registry;

    // Category filter
    if (selectedCategories.size > 0) {
      views = views.filter((v) => selectedCategories.has(v.category));
    }

    // Search filter + ranking
    if (searchQuery.trim()) {
      const scored = views
        .map((v) => ({ entry: v, score: matchesSearch(v, searchQuery.trim()) }))
        .filter((s) => s.score > 0);
      scored.sort((a, b) => b.score - a.score);
      views = scored.map((s) => s.entry);
    }

    return views;
  }, [searchQuery, selectedCategories]);

  return {
    searchQuery,
    selectedCategories,
    filteredViews,
    setSearchQuery,
    toggleCategory,
    clearFilters,
  };
}
