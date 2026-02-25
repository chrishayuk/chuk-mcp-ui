# Component Spec: @chuk/view-form

## Identity

| Field       | Value                                                                                                  |
|-------------|--------------------------------------------------------------------------------------------------------|
| Name        | `@chuk/view-form`                                                                                      |
| Type        | `form`                                                                                                 |
| Version     | `1.0`                                                                                                  |
| Category    | Tier 2 -- Composition                                                                                  |
| Description | Dynamic form renderer from JSON Schema with validation, multiple widget types, field groups, and server tool submission. |

---

## Dependencies

| Kind     | Package / Tool                         |
|----------|----------------------------------------|
| Runtime  | `react` ^18.3.0, `react-dom` ^18.3.0  |
| Runtime  | `@chuk/view-shared` workspace:*        |
| Runtime  | `@modelcontextprotocol/ext-apps` ^1.0.0|
| Build    | `vite` ^6.0.0                          |
| Build    | `vite-plugin-singlefile` ^2.0.0        |
| Build    | `@vitejs/plugin-react` ^4.3.0          |
| Build    | `typescript` ^5.7.0                    |
| Protocol | `@modelcontextprotocol/ext-apps`       |

---

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool |
| `useViewEvents` | Cross-view event emission |

---

## Schema

### `FormContent`

```typescript
interface FormContent {
  type: "form";
  version: "1.0";
  title?: string;
  description?: string;
  schema: JSONSchemaField;
  uiSchema?: UISchema;
  initialValues?: Record<string, unknown>;
  submitTool: string;
  submitLabel?: string;
  cancelable?: boolean;
  layout?: "vertical" | "horizontal";
}
```

### `JSONSchemaField`

```typescript
interface JSONSchemaField {
  type: "object";
  required?: string[];
  properties: Record<string, FieldSchema>;
}
```

### `FieldSchema`

```typescript
interface FieldSchema {
  type: "string" | "number" | "integer" | "boolean";
  title?: string;
  description?: string;
  default?: unknown;
  enum?: (string | number)[];
  enumLabels?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}
```

### `UISchema`

```typescript
interface UISchema {
  order?: string[];
  fields?: Record<string, FieldUI>;
  groups?: FieldGroup[];
}
```

### `FieldUI`

```typescript
interface FieldUI {
  widget?:
    | "text"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "slider"
    | "date"
    | "datetime"
    | "color"
    | "password"
    | "hidden"
    | "number";
  placeholder?: string;
  help?: string;
  disabled?: boolean;
  readonly?: boolean;
}
```

### `FieldGroup`

```typescript
interface FieldGroup {
  title: string;
  fields: string[];
  collapsible?: boolean;
  collapsed?: boolean;
}
```

### Defaults

| Field            | Default                                                                                  |
|------------------|------------------------------------------------------------------------------------------|
| `submitLabel`    | `"Submit"`                                                                               |
| `layout`         | `"vertical"`                                                                             |
| Widget inference | `boolean` -> checkbox, `enum` <= 4 -> radio, `enum` > 4 -> select, `number`/`integer` -> number, else -> text |
| Boolean default  | `false` (when no explicit default is provided)                                           |
| Other defaults   | `""` (empty string, when no explicit default is provided)                                |

### Validation Rules

| Rule            | Applies to           | Behaviour                                                  |
|-----------------|----------------------|------------------------------------------------------------|
| Required        | Any field in `schema.required` | Rejects `undefined`, `null`, and `""` (empty string)   |
| Minimum         | `number`, `integer`  | `value < field.minimum` produces `"Minimum value is {n}."` |
| Maximum         | `number`, `integer`  | `value > field.maximum` produces `"Maximum value is {n}."` |
| Min length       | `string`             | `value.length < field.minLength` produces `"Minimum length is {n}."` |
| Max length       | `string`             | `value.length > field.maxLength` produces `"Maximum length is {n}."` |
| Pattern         | `string`             | Fails `new RegExp(pattern).test(value)` produces `"Invalid format."` |

Validation is run synchronously on submit. Empty/missing optional fields are skipped (no constraint checks).

---

## Rendering

### Layout

- Full-height container with `overflow: auto`
- Centered form with `max-width: 600px` and `24px` padding
- Title rendered as `<h2>` (18px, weight 600), description as `<p>` (14px, secondary color)
- Fields rendered vertically with `16px` bottom margin
- Optional field groups rendered as `<fieldset>` with collapsible `<legend>`
- Submit button in an actions row with `24px` top margin

### Widget Mapping

| Widget       | HTML Element                          | Notes                                  |
|--------------|---------------------------------------|----------------------------------------|
| `text`       | `<input type="text">`                 | Default for string fields              |
| `textarea`   | `<textarea>`                          | Min-height 80px, vertical resize       |
| `select`     | `<select>`                            | Includes empty "Select..." option      |
| `radio`      | `<input type="radio">` group          | Vertical flex layout, 6px gap          |
| `checkbox`   | `<input type="checkbox">`             | Label appears after checkbox           |
| `slider`     | `<input type="range">`                | Displays current value beside slider   |
| `number`     | `<input type="number">`               | Coerces to `Number` on change          |
| `password`   | `<input type="password">`             | Standard masked input                  |
| `date`       | `<input type="date">`                 | Browser native date picker             |
| `datetime`   | `<input type="datetime-local">`       | Browser native datetime picker         |
| `color`      | `<input type="color">`                | Browser native color picker            |
| `hidden`     | *(not rendered)*                       | Field is completely omitted from DOM   |

### States

| State       | Behaviour                                                              |
|-------------|------------------------------------------------------------------------|
| Loading     | `<Fallback message="Connecting..." />` shown while `isConnected` is false |
| No data     | `<Fallback content={content} />` shown when `data` is null            |
| Populated   | Form rendered with `initialValues` or computed defaults                |
| Validating  | Inline `<p>` error messages appear beneath each invalid field (12px, red `#e63946`) |
| Submitting  | Button text changes to `"Submitting..."` and button is disabled        |
| Error       | Falls back to plain text content rendering via `Fallback`              |

### Theme Integration

Uses `--chuk-*` CSS custom properties imported from `@chuk/view-shared` via `CSS_VARS`:

| CSS Variable                  | Applied to                        |
|-------------------------------|-----------------------------------|
| `--chuk-font-family`          | Container font-family             |
| `--chuk-color-text`           | Container text color, input text  |
| `--chuk-color-text-secondary` | Description text, help text       |
| `--chuk-color-background`     | Container background              |
| `--chuk-color-surface`        | Input background                  |
| `--chuk-color-border`         | Input borders, fieldset borders   |
| `--chuk-color-primary`        | Submit button background          |
| `--chuk-border-radius`        | Input corners, fieldset corners, button corners |

---

## Interactions

### User Actions

| Action          | Trigger              | Result                                                        |
|-----------------|----------------------|---------------------------------------------------------------|
| Fill field      | Input change event   | Updates `values[key]`; clears any existing error for that key |
| Toggle group    | Click on `<legend>`  | Collapses or expands the field group (only if `collapsible` is true) |
| Submit form     | Click submit button or press Enter | Runs validation; if valid, calls `callServerTool(submitTool, values)` |

### Server Calls

Submit triggers `callTool(submitTool, values)` via the `useView` hook from `@chuk/view-shared`, where `values` is the complete form state object (`Record<string, unknown>`).

The call is wrapped in try/finally so that `submitting` state is always reset, regardless of success or failure.

---

## Model Context Updates

None.

---

## Display Mode

Not applicable. The view stays inline-only.

---

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

---

## Streaming

Not implemented. The form renders from a single `structuredContent` payload delivered via `postMessage`.

---

## Composition

| Direction | Mechanism                                                                 |
|-----------|---------------------------------------------------------------------------|
| As Child  | Receives `structuredContent` via `postMessage` through the `useView` hook |
| As Parent | Not applicable -- this component does not embed child views               |

### Cross-View Events

None.

---

## CSP Requirements

None. The component is built as a single-file HTML artifact (`vite-plugin-singlefile`) with all JavaScript and CSS inlined. No external network requests are made at runtime.

---

## Accessibility

| Feature                | Implementation                                                        |
|------------------------|-----------------------------------------------------------------------|
| Label association      | All inputs have `id={fieldKey}` with matching `<label htmlFor={fieldKey}>` |
| Required indicator     | Required fields display a red asterisk (`*`) after the label          |
| Checkbox label order   | Label wraps checkbox input (label appears after the checkbox)         |
| Validation feedback    | Inline error messages rendered as `<p>` elements below each field     |
| Native form semantics  | Uses `<form>` element with `onSubmit` for keyboard submit via Enter   |
| Fieldset semantics     | Groups use `<fieldset>` and `<legend>` for semantic grouping          |
| Color contrast         | Error and required indicators use `#e63946`; inherits host theme colors |

---

## Size Budget

| Metric   | Target   | Actual              |
|----------|----------|---------------------|
| Raw      | < 150 KB | 809 KB              |
| Gzip     | --       | 230 KB              |

---

## SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `DynamicForm` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## File Structure

```
apps/form/
  mcp-app.html          # Entry point HTML shell
  package.json          # Package manifest (@chuk/view-form)
  tsconfig.json         # TypeScript configuration
  vite.config.ts        # Vite build config with singlefile plugin
  src/
    mcp-app.tsx         # React root mount
    App.tsx             # FormView, DynamicForm, FieldGroupSection, FieldRenderer
    schema.ts           # TypeScript interfaces (FormContent, FieldSchema, etc.)
  dist/
    mcp-app.html        # Built single-file artifact
```

### Internal Components

| Component            | Responsibility                                         |
|----------------------|--------------------------------------------------------|
| `FormView`           | Top-level hook consumer; handles connection/loading states |
| `DynamicForm`        | Manages form state, validation, and submit logic       |
| `FieldGroupSection`  | Renders a collapsible `<fieldset>` for grouped fields  |
| `FieldRenderer`      | Renders a single field based on schema and UI config   |

### Internal Helpers

| Function        | Purpose                                                       |
|-----------------|---------------------------------------------------------------|
| `inferWidget`   | Derives widget type from `FieldSchema` when no explicit `ui.widget` is set |
| `coerceValue`   | Converts raw string input to `Number` for numeric field types |
| `buildDefaults` | Constructs initial values from `field.default`, falling back to `false` for booleans and `""` for others |
| `validate`      | Synchronous validation returning `Record<string, string>` error map |

---

## Test Cases

### TC-01: Minimal form renders with defaults

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_basic",
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" }
    }
  }
}
```

**Expected:**
- Form renders with a single text input labeled `"name"`
- Submit button reads `"Submit"` (default `submitLabel`)
- No title or description is shown
- Input value is `""` (default for string with no explicit default)

---

### TC-02: Title and description displayed

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "title": "User Registration",
  "description": "Please fill out the form below.",
  "submitTool": "register_user",
  "schema": {
    "type": "object",
    "properties": {
      "email": { "type": "string", "title": "Email Address" }
    }
  }
}
```

**Expected:**
- `<h2>` contains `"User Registration"`
- `<p>` description contains `"Please fill out the form below."`
- Input label reads `"Email Address"` (from `title`, not field key)

---

### TC-03: Required field validation

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_required",
  "schema": {
    "type": "object",
    "required": ["username"],
    "properties": {
      "username": { "type": "string", "title": "Username" }
    }
  }
}
```

**Steps:**
1. Leave `username` empty
2. Click submit

**Expected:**
- Submit is prevented (no `callTool` invocation)
- Error message `"This field is required."` appears below the username field
- Red asterisk (`*`) is displayed after the `"Username"` label

---

### TC-04: Number min/max validation

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_number",
  "schema": {
    "type": "object",
    "properties": {
      "age": { "type": "integer", "title": "Age", "minimum": 18, "maximum": 120 }
    }
  }
}
```

**Steps:**
1. Enter `10` in the age field
2. Click submit

**Expected:**
- Error message `"Minimum value is 18."` appears below the age field
- No `callTool` invocation

**Steps (alternate):**
1. Enter `200` in the age field
2. Click submit

**Expected:**
- Error message `"Maximum value is 120."` appears below the age field

---

### TC-05: String minLength, maxLength, and pattern validation

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_string_validation",
  "schema": {
    "type": "object",
    "properties": {
      "code": {
        "type": "string",
        "title": "Code",
        "minLength": 3,
        "maxLength": 10,
        "pattern": "^[A-Z]+$"
      }
    }
  }
}
```

**Steps and expected results:**

| Input value | Expected error               |
|-------------|------------------------------|
| `"AB"`      | `"Minimum length is 3."`     |
| `"ABCDEFGHIJK"` | `"Maximum length is 10."` |
| `"abc"`     | `"Invalid format."`          |
| `"ABC"`     | No error, form submits       |

---

### TC-06: Widget inference from schema

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_widgets",
  "schema": {
    "type": "object",
    "properties": {
      "agree": { "type": "boolean", "title": "I agree" },
      "size": { "type": "string", "enum": ["S", "M", "L"] },
      "country": { "type": "string", "enum": ["US", "UK", "CA", "DE", "FR"] },
      "quantity": { "type": "number", "title": "Quantity" },
      "note": { "type": "string", "title": "Note" }
    }
  }
}
```

**Expected widget mapping:**

| Field      | Inferred widget | Reason                       |
|------------|-----------------|------------------------------|
| `agree`    | `checkbox`      | `type === "boolean"`         |
| `size`     | `radio`         | `enum` with 3 items (<= 4)  |
| `country`  | `select`        | `enum` with 5 items (> 4)   |
| `quantity` | `number`        | `type === "number"`          |
| `note`     | `text`          | `type === "string"`, no enum |

---

### TC-07: Explicit widget override via uiSchema

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_override",
  "schema": {
    "type": "object",
    "properties": {
      "bio": { "type": "string", "title": "Biography" },
      "rating": { "type": "number", "title": "Rating", "minimum": 0, "maximum": 10 }
    }
  },
  "uiSchema": {
    "fields": {
      "bio": { "widget": "textarea", "placeholder": "Tell us about yourself..." },
      "rating": { "widget": "slider" }
    }
  }
}
```

**Expected:**
- `bio` renders as `<textarea>` with placeholder `"Tell us about yourself..."`
- `rating` renders as `<input type="range">` with min=0 and max=10, value displayed beside slider

---

### TC-08: Hidden widget omits field from DOM

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_hidden",
  "schema": {
    "type": "object",
    "properties": {
      "visible_field": { "type": "string", "title": "Name" },
      "tracking_id": { "type": "string" }
    }
  },
  "uiSchema": {
    "fields": {
      "tracking_id": { "widget": "hidden" }
    }
  },
  "initialValues": {
    "tracking_id": "abc-123"
  }
}
```

**Expected:**
- `tracking_id` field is not rendered in the DOM
- `visible_field` renders normally
- On submit, `values` still includes `{ tracking_id: "abc-123" }` because it is in `initialValues`

---

### TC-09: Field order via uiSchema.order

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_ordered",
  "schema": {
    "type": "object",
    "properties": {
      "first": { "type": "string" },
      "second": { "type": "string" },
      "third": { "type": "string" }
    }
  },
  "uiSchema": {
    "order": ["third", "first", "second"]
  }
}
```

**Expected:**
- Fields render in order: `third`, `first`, `second` (not object key order)

---

### TC-10: Field groups with collapsible sections

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_groups",
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "email": { "type": "string" },
      "street": { "type": "string" },
      "city": { "type": "string" }
    }
  },
  "uiSchema": {
    "groups": [
      { "title": "Personal Info", "fields": ["name", "email"] },
      { "title": "Address", "fields": ["street", "city"], "collapsible": true, "collapsed": true }
    ]
  }
}
```

**Expected:**
- Two `<fieldset>` elements rendered
- "Personal Info" legend with `name` and `email` fields visible
- "Address" legend with a right-pointing triangle (`U+25B6`), fields hidden (initially collapsed)
- Clicking "Address" legend expands to show `street` and `city` fields, triangle changes to down-pointing (`U+25BC`)

---

### TC-11: Initial values populate form

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_prefilled",
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "title": "Name" },
      "active": { "type": "boolean", "title": "Active" }
    }
  },
  "initialValues": {
    "name": "Alice",
    "active": true
  }
}
```

**Expected:**
- Name input has value `"Alice"`
- Active checkbox is checked
- On submit without changes, `callTool` receives `{ name: "Alice", active: true }`

---

### TC-12: Default values from schema

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_defaults",
  "schema": {
    "type": "object",
    "properties": {
      "color": { "type": "string", "default": "blue" },
      "count": { "type": "number", "default": 5 },
      "enabled": { "type": "boolean" },
      "other": { "type": "string" }
    }
  }
}
```

**Expected (from `buildDefaults`):**
- `color` = `"blue"` (explicit default)
- `count` = `5` (explicit default)
- `enabled` = `false` (boolean with no default falls back to `false`)
- `other` = `""` (string with no default falls back to `""`)

---

### TC-13: Custom submit label

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "create_ticket",
  "submitLabel": "Create Ticket",
  "schema": {
    "type": "object",
    "properties": {
      "summary": { "type": "string" }
    }
  }
}
```

**Expected:**
- Submit button text reads `"Create Ticket"` instead of `"Submit"`

---

### TC-14: Enum with custom labels

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_enum_labels",
  "schema": {
    "type": "object",
    "properties": {
      "priority": {
        "type": "string",
        "enum": ["P1", "P2", "P3"],
        "enumLabels": ["Critical", "High", "Normal"]
      }
    }
  }
}
```

**Expected:**
- Radio buttons render with labels `"Critical"`, `"High"`, `"Normal"` (3 items, so radio inferred)
- Selected value submitted is `"P1"`, `"P2"`, or `"P3"` (enum values, not labels)

---

### TC-15: Select widget with placeholder

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_select",
  "schema": {
    "type": "object",
    "properties": {
      "region": {
        "type": "string",
        "enum": ["us-east", "us-west", "eu-west", "eu-central", "ap-south"]
      }
    }
  },
  "uiSchema": {
    "fields": {
      "region": { "placeholder": "Choose a region..." }
    }
  }
}
```

**Expected:**
- Renders as `<select>` (5 enum values > 4)
- First option reads `"Choose a region..."` (custom placeholder, not default `"Select..."`)
- First option has value `""`

---

### TC-16: Disabled and readonly fields

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_disabled",
  "schema": {
    "type": "object",
    "properties": {
      "locked": { "type": "string", "title": "Locked Field" },
      "viewonly": { "type": "string", "title": "View Only" }
    }
  },
  "uiSchema": {
    "fields": {
      "locked": { "disabled": true },
      "viewonly": { "readonly": true }
    }
  },
  "initialValues": {
    "locked": "cannot change",
    "viewonly": "read only"
  }
}
```

**Expected:**
- `locked` input has `disabled` attribute; user cannot interact
- `viewonly` input has `readOnly` attribute; user cannot modify but can select/copy

---

### TC-17: Help text displayed

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_help",
  "schema": {
    "type": "object",
    "properties": {
      "password": { "type": "string", "title": "Password" }
    }
  },
  "uiSchema": {
    "fields": {
      "password": {
        "widget": "password",
        "help": "Must be at least 8 characters."
      }
    }
  }
}
```

**Expected:**
- Input renders as `<input type="password">`
- Help text `"Must be at least 8 characters."` appears below the input in secondary color, 12px font

---

### TC-18: Submitting state disables button

**Steps:**
1. Render any valid form
2. Fill in required fields
3. Click submit
4. Observe button during `callTool` execution

**Expected:**
- Button text changes from `"Submit"` to `"Submitting..."`
- Button `disabled` attribute is set to `true`
- After `callTool` resolves (success or failure), button reverts to `"Submit"` and re-enables

---

### TC-19: Error clears on field change

**Steps:**
1. Render form with required field `name`
2. Leave `name` empty and submit (error appears)
3. Type any character in the `name` field

**Expected:**
- After step 2: `"This field is required."` is shown
- After step 3: error message disappears immediately (cleared in `setValue`)

---

### TC-20: Successful submission calls callTool with values

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "create_user",
  "schema": {
    "type": "object",
    "required": ["name", "age"],
    "properties": {
      "name": { "type": "string" },
      "age": { "type": "integer", "minimum": 0 }
    }
  }
}
```

**Steps:**
1. Enter `"Bob"` in name
2. Enter `30` in age
3. Click submit

**Expected:**
- `callTool("create_user", { name: "Bob", age: 30 })` is invoked
- No validation errors

---

### TC-21: Loading state before connection

**Scenario:** `isConnected` returns `false` from `useView`.

**Expected:**
- Renders `<Fallback message="Connecting..." />`
- No form elements are present in the DOM

---

### TC-22: Fallback state when data is null

**Scenario:** `isConnected` is `true`, but `data` is `null` and raw `content` is `"Something went wrong"`.

**Expected:**
- Renders `<Fallback content="Something went wrong" />`
- No form elements are present in the DOM

---

### TC-23: Integer field coercion

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_coerce",
  "schema": {
    "type": "object",
    "properties": {
      "qty": { "type": "integer", "title": "Quantity" }
    }
  }
}
```

**Steps:**
1. Type `"42"` in the quantity field
2. Submit

**Expected:**
- The `number` widget input coerces the string `"42"` to the number `42`
- `callTool("submit_coerce", { qty: 42 })` is invoked (number, not string)

---

### TC-24: Select coercion for numeric enum

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_num_enum",
  "schema": {
    "type": "object",
    "properties": {
      "level": {
        "type": "integer",
        "enum": [1, 2, 3, 4, 5]
      }
    }
  }
}
```

**Expected:**
- Renders as `<select>` (5 items > 4)
- Selecting `"3"` from dropdown coerces to number `3` via `coerceValue`
- Submitted as `{ level: 3 }` (number, not string)

---

### TC-25: Date and datetime widgets

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_dates",
  "schema": {
    "type": "object",
    "properties": {
      "start_date": { "type": "string", "title": "Start Date" },
      "meeting_time": { "type": "string", "title": "Meeting Time" }
    }
  },
  "uiSchema": {
    "fields": {
      "start_date": { "widget": "date" },
      "meeting_time": { "widget": "datetime" }
    }
  }
}
```

**Expected:**
- `start_date` renders as `<input type="date">`
- `meeting_time` renders as `<input type="datetime-local">`

---

### TC-26: Color picker widget

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_color",
  "schema": {
    "type": "object",
    "properties": {
      "theme_color": { "type": "string", "title": "Theme Color" }
    }
  },
  "uiSchema": {
    "fields": {
      "theme_color": { "widget": "color" }
    }
  }
}
```

**Expected:**
- `theme_color` renders as `<input type="color">`
- Submitted value is a hex color string (e.g. `"#ff5733"`)

---

### TC-27: Slider with default range

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_slider_default",
  "schema": {
    "type": "object",
    "properties": {
      "volume": { "type": "number", "title": "Volume" }
    }
  },
  "uiSchema": {
    "fields": {
      "volume": { "widget": "slider" }
    }
  }
}
```

**Expected:**
- Slider renders with `min=0` and `max=100` (defaults when `minimum`/`maximum` not set)
- Initial value is `0` (fallback for `minimum ?? 0`)
- Current value `"0"` displayed beside the slider

---

### TC-28: Multiple validation errors on single submit

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_multi_error",
  "schema": {
    "type": "object",
    "required": ["name", "email"],
    "properties": {
      "name": { "type": "string", "title": "Name" },
      "email": { "type": "string", "title": "Email", "pattern": "^.+@.+$" },
      "age": { "type": "integer", "minimum": 0, "maximum": 150 }
    }
  }
}
```

**Steps:**
1. Leave `name` empty
2. Leave `email` empty
3. Enter `200` in age
4. Click submit

**Expected:**
- `name` shows `"This field is required."`
- `email` shows `"This field is required."` (required check runs before pattern check; empty values skip constraint checks)
- `age` shows `"Maximum value is 150."`
- All three errors are displayed simultaneously

---

### TC-29: Non-collapsible group ignores click

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "submitTool": "submit_static_group",
  "schema": {
    "type": "object",
    "properties": {
      "a": { "type": "string" },
      "b": { "type": "string" }
    }
  },
  "uiSchema": {
    "groups": [
      { "title": "Static Group", "fields": ["a", "b"] }
    ]
  }
}
```

**Steps:**
1. Click on "Static Group" legend

**Expected:**
- No collapse/expand behaviour (neither `collapsible` nor `collapsed` are set)
- No triangle indicator in legend text
- Fields remain visible

---

### TC-30: Full complex form end-to-end

**Input:**
```json
{
  "type": "form",
  "version": "1.0",
  "title": "Create Issue",
  "description": "File a new issue for the project.",
  "submitTool": "create_issue",
  "submitLabel": "Create Issue",
  "schema": {
    "type": "object",
    "required": ["title", "priority"],
    "properties": {
      "title": { "type": "string", "title": "Issue Title", "minLength": 5 },
      "description": { "type": "string", "title": "Description" },
      "priority": {
        "type": "string",
        "title": "Priority",
        "enum": ["low", "medium", "high"],
        "enumLabels": ["Low", "Medium", "High"]
      },
      "assignee": { "type": "string", "title": "Assignee" },
      "notify": { "type": "boolean", "title": "Notify team", "default": true },
      "ref_id": { "type": "string" }
    }
  },
  "uiSchema": {
    "order": ["title", "description", "priority", "assignee", "notify", "ref_id"],
    "fields": {
      "description": { "widget": "textarea", "placeholder": "Describe the issue..." },
      "assignee": { "help": "Leave blank to auto-assign." },
      "ref_id": { "widget": "hidden" }
    }
  },
  "initialValues": {
    "ref_id": "proj-42"
  }
}
```

**Expected:**
- Title `"Create Issue"` and description `"File a new issue for the project."` rendered
- Fields in order: title (text, required), description (textarea), priority (radio with 3 options), assignee (text with help), notify (checkbox, default checked), ref_id (hidden)
- `ref_id` not visible in DOM
- Submit button reads `"Create Issue"`
- Submitting with `title = "Bug"` (too short) shows `"Minimum length is 5."`
- Submitting with `title = "Login fails"` and `priority = "high"` succeeds
- `callTool("create_issue", { title: "Login fails", description: "", priority: "high", assignee: "", notify: true, ref_id: "proj-42" })` is invoked

## Storybook Stories

Story file: `apps/form/src/DynamicForm.stories.tsx`

| Story | Description |
|-------|-------------|
| Minimal | 3 fields: name, email, message |
| WithGroups | 2 field groups with collapsible section |
| AllWidgets | 12 widget types demonstrating every input variant |
