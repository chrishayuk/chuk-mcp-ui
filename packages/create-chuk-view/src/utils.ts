/** "my-custom-view" -> "MyCustomView" */
export function toPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/** "my-custom-view" -> "myCustomView" */
export function toCamelCase(kebab: string): string {
  const pascal = toPascalCase(kebab);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/** Validate view name: lowercase letters, numbers, hyphens only */
export function validateViewName(name: string): string | null {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    return "View name must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens.";
  }
  if (name.length < 2 || name.length > 50) {
    return "View name must be between 2 and 50 characters.";
  }
  return null;
}
