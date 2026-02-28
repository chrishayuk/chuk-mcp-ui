import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  theme: "light" | "dark";
  onThemeToggle: (theme: "light" | "dark") => void;
  /** Current view name when on detail page, null for catalogue grid */
  viewName?: string | null;
  onNavigateHome: () => void;
}

export function Header({ theme, onThemeToggle, viewName, onNavigateHome }: HeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/50">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onNavigateHome}
          className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
        >
          MCP Views
        </button>
        {viewName && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{viewName}</span>
          </>
        )}
      </div>
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </div>
  );
}
