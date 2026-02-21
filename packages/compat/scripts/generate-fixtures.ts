/**
 * generate-fixtures.ts
 *
 * Reads every apps/* /schemas/input.json, generates MINIMAL valid
 * structuredContent for each view, validates with Ajv, and writes
 * the result to fixtures/minimal.json.
 *
 * Run: tsx scripts/generate-fixtures.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "../../..");
const APPS_DIR = path.join(ROOT, "apps");
const OUT_FILE = path.resolve(__dirname, "../fixtures/minimal.json");

// ---------------------------------------------------------------------------
// Schema helpers
// ---------------------------------------------------------------------------

interface JsonSchema {
  type?: string;
  const?: unknown;
  enum?: unknown[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  default?: unknown;
  $ref?: string;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  definitions?: Record<string, JsonSchema>;
  $defs?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
}

/**
 * Resolve a local $ref like "#/definitions/Foo" or "#/$defs/bar"
 * against the root schema.
 */
function resolveRef(ref: string, rootSchema: JsonSchema): JsonSchema {
  const parts = ref.replace(/^#\//, "").split("/");
  let current: unknown = rootSchema;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    }
  }
  return (current as JsonSchema) ?? {};
}

/**
 * Generate a minimal valid value for a given JSON Schema node.
 * Only fills required fields; skips optional ones entirely.
 */
function generateMinimal(
  schema: JsonSchema,
  rootSchema: JsonSchema,
  _depth = 0,
): unknown {
  // Prevent infinite recursion
  if (_depth > 20) return undefined;

  // Handle $ref
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, rootSchema);
    return generateMinimal(resolved, rootSchema, _depth + 1);
  }

  // Handle oneOf / anyOf -- pick the first variant
  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateMinimal(schema.oneOf[0], rootSchema, _depth + 1);
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateMinimal(schema.anyOf[0], rootSchema, _depth + 1);
  }
  if (schema.allOf && schema.allOf.length > 0) {
    // Merge all schemas into one
    const merged: JsonSchema = {};
    for (const sub of schema.allOf) {
      const resolved = sub.$ref
        ? resolveRef(sub.$ref, rootSchema)
        : sub;
      Object.assign(merged, resolved);
      if (resolved.properties) {
        merged.properties = { ...merged.properties, ...resolved.properties };
      }
      if (resolved.required) {
        merged.required = [
          ...(merged.required ?? []),
          ...resolved.required,
        ];
      }
    }
    return generateMinimal(merged, rootSchema, _depth + 1);
  }

  // const
  if (schema.const !== undefined) {
    return schema.const;
  }

  // enum -- first value
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  // By type
  switch (schema.type) {
    case "string":
      return "test";

    case "number":
    case "integer":
      return schema.minimum ?? 0;

    case "boolean":
      return false;

    case "array": {
      // Respect minItems -- generate that many items if required
      const minItems = schema.minItems ?? 0;
      if (minItems > 0 && schema.items) {
        const arr: unknown[] = [];
        for (let i = 0; i < minItems; i++) {
          arr.push(generateMinimal(schema.items, rootSchema, _depth + 1));
        }
        return arr;
      }
      return [];
    }

    case "object": {
      const obj: Record<string, unknown> = {};
      const required = schema.required ?? [];
      const props = schema.properties ?? {};

      for (const key of required) {
        const propSchema = props[key];
        if (propSchema) {
          obj[key] = generateMinimal(propSchema, rootSchema, _depth + 1);
        } else {
          // Required but no schema defined -- use empty string
          obj[key] = "test";
        }
      }
      return obj;
    }

    default:
      // No type specified -- if it has properties, treat as object
      if (schema.properties) {
        const obj: Record<string, unknown> = {};
        const required = schema.required ?? [];
        for (const key of required) {
          const propSchema = schema.properties[key];
          if (propSchema) {
            obj[key] = generateMinimal(propSchema, rootSchema, _depth + 1);
          } else {
            obj[key] = "test";
          }
        }
        return obj;
      }
      // Truly unconstrained -- return null
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const fixtures: Record<string, object> = {};
  const errors: string[] = [];

  // Discover all apps with schemas
  const appDirs = fs
    .readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let processed = 0;
  let validated = 0;

  for (const appName of appDirs) {
    const schemaPath = path.join(APPS_DIR, appName, "schemas", "input.json");
    if (!fs.existsSync(schemaPath)) continue;

    const rawSchema = JSON.parse(fs.readFileSync(schemaPath, "utf-8")) as JsonSchema;
    const fixture = generateMinimal(rawSchema, rawSchema) as object;
    fixtures[appName] = fixture;
    processed++;

    // Validate the fixture against the schema
    const validate = ajv.compile(rawSchema);
    const valid = validate(fixture);
    if (valid) {
      validated++;
    } else {
      const errMsg = `${appName}: ${ajv.errorsText(validate.errors)}`;
      errors.push(errMsg);
    }
  }

  // Ensure fixtures directory exists
  const fixturesDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(OUT_FILE, JSON.stringify(fixtures, null, 2) + "\n");

  console.log(`Processed: ${processed} schemas`);
  console.log(`Validated: ${validated}/${processed}`);

  if (errors.length > 0) {
    console.log(`\nValidation errors (${errors.length}):`);
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log(`\nOutput: ${OUT_FILE}`);
}

main();
