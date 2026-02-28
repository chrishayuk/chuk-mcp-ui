interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 p-4 font-mono text-sm resize-none bg-background text-foreground border-none outline-none"
        placeholder="Paste your structuredContent JSON here..."
        aria-label="JSON editor"
        aria-invalid={!!error}
        aria-describedby={error ? "json-editor-error" : undefined}
      />
      {error && (
        <div
          id="json-editor-error"
          role="alert"
          className="px-4 py-2 text-sm text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950 border-t border-border"
        >
          {error}
        </div>
      )}
    </div>
  );
}
