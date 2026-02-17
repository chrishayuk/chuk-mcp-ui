/**
 * Resolve template strings like "{properties.id}" from a context object.
 * Used by Views to resolve popup action arguments from feature data.
 */
export function resolveTemplates(
  templates: Record<string, string>,
  context: Record<string, unknown>
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [key, template] of Object.entries(templates)) {
    resolved[key] = resolveTemplate(template, context);
  }
  return resolved;
}

function resolveTemplate(
  template: string,
  context: Record<string, unknown>
): string {
  return template.replace(/\{([^}]+)\}/g, (_, path: string) => {
    const value = getNestedValue(context, path);
    return value !== undefined && value !== null ? String(value) : "";
  });
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
