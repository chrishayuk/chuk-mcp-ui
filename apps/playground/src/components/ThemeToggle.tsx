import { applyTheme } from "@chuk/view-shared";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: (theme: "light" | "dark") => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
    onToggle(next);
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1 text-sm rounded border border-border bg-muted text-foreground hover:bg-accent"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
