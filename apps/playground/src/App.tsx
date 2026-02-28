import { Component, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { getView, getViewsByCategory, type Category } from "./catalogue-registry";
import { useCatalogueFilter } from "./hooks/useCatalogueFilter";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { CatalogueGrid } from "./components/CatalogueGrid";
import { ViewDetailPage } from "./components/ViewDetailPage";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Something went wrong</p>
          <p className="text-sm text-muted-foreground max-w-md">
            {this.state.error.message}
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = "#/";
            }}
            className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to catalogue
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type Route =
  | { page: "catalogue" }
  | { page: "detail"; view: string };

function parseHash(): Route {
  const hash = window.location.hash;
  const viewMatch = hash.match(/^#\/view\/([a-z][a-z0-9-]*)$/);
  if (viewMatch) {
    return { page: "detail", view: viewMatch[1] };
  }
  return { page: "catalogue" };
}

export function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const filter = useCatalogueFilter();

  // Category counts (full registry, not filtered)
  const categoryCounts = useMemo(() => {
    const byCategory = getViewsByCategory();
    const counts = new Map<Category, number>();
    for (const [cat, views] of byCategory) {
      counts.set(cat, views.length);
    }
    return counts;
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Navigation
  const navigateHome = useCallback(() => {
    window.location.hash = "#/";
  }, []);

  const navigateToView = useCallback((name: string) => {
    window.location.hash = `#/view/${name}`;
  }, []);

  // Current view entry for header breadcrumb
  const currentViewEntry = useMemo(
    () => (route.page === "detail" ? getView(route.view) : null),
    [route],
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <Header
        theme={theme}
        onThemeToggle={setTheme}
        viewName={currentViewEntry?.displayName ?? null}
        onNavigateHome={navigateHome}
      />

      <ErrorBoundary>
        {route.page === "catalogue" && (
          <div className="flex-1 flex overflow-hidden">
            <Sidebar filter={filter} categoryCounts={categoryCounts} />
            <div className="flex-1 overflow-auto">
              <CatalogueGrid views={filter.filteredViews} onSelectView={navigateToView} theme={theme} />
            </div>
          </div>
        )}

        {route.page === "detail" && currentViewEntry && (
          <ViewDetailPage key={currentViewEntry.name} entry={currentViewEntry} theme={theme} />
        )}

        {route.page === "detail" && !currentViewEntry && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            View not found.{" "}
            <button onClick={navigateHome} className="text-primary hover:underline ml-1">
              Back to catalogue
            </button>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
