import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  theme: "light" | "dark";
  onThemeToggle: (theme: "light" | "dark") => void;
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/50">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">
          chuk-mcp-ui Playground
        </h1>
        <span className="text-xs text-muted-foreground">
          Paste JSON, see it render
        </span>
      </div>
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </div>
  );
}
