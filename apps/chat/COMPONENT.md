# Component Spec: @chuk/view-chat

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-chat`                                                     |
| Type        | `chat`                                                                |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Embedded chat interface View that renders a message thread with user/assistant/system bubbles, typing indicator, suggestion chips, and an input bar that sends messages via `callTool`. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | framer-motion                           | `^11.0.0`     |
| Runtime  | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |
| Build    | vite                                    | `^6.0.0`      |
| Build    | vite-plugin-singlefile                  | `^2.0.0`      |
| Build    | typescript                              | `^5.7.0`      |
| Build    | `@vitejs/plugin-react`                  | `^4.3.0`      |
| Protocol | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |

---

## 2b. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool |

---

## 3. Schema

### 3.1 Root -- `ChatContent`

```typescript
interface ChatContent {
  type: "chat";
  version: "1.0";
  title?: string;
  messages: ChatMessage[];
  respondTool: string;
  placeholder?: string;
  suggestions?: string[];
  showTypingIndicator?: boolean;
}
```

### 3.2 `ChatMessage`

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  status?: "sending" | "sent" | "error";
}
```

### 3.3 Defaults

| Field                | Default               |
|----------------------|-----------------------|
| `title`              | `undefined`           |
| `placeholder`        | `"Type a message..."` |
| `suggestions`        | `undefined`           |
| `showTypingIndicator`| `undefined`           |
| `timestamp`          | `undefined`           |
| `status`             | `undefined`           |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column: optional header, scrollable message area, optional suggestions bar, and sticky input area at the bottom.

- **Header**: Title with `border-b border-border`, `p-3`.
- **Message area**: `ScrollArea` with `flex-1`, `p-4`. Auto-scrolls to bottom on new messages.
- **Suggestions bar**: Horizontal flex with `gap-2`, `overflow-x-auto`, above input. Each suggestion is a `Button variant="outline" size="sm"`.
- **Input area**: Sticky bottom, `flex gap-2 p-3 border-t border-border`. Contains `Input` component and `Button` with "Send" text.

### 4.2 Message Bubbles

| Role        | Alignment | Background                    | Border Radius                    |
|-------------|-----------|-------------------------------|----------------------------------|
| `user`      | Right     | `bg-primary text-primary-foreground` | `rounded-2xl rounded-br-sm` |
| `assistant` | Left      | `bg-muted text-foreground`    | `rounded-2xl rounded-bl-sm`      |
| `system`    | Centered  | None (no bubble)              | N/A                              |

- Each bubble: content text, timestamp below (`text-xs text-muted-foreground`).
- Error status: `ring-1 ring-destructive` on bubble, "Failed to send" text.
- System messages: `text-xs text-muted-foreground italic`, centered, no bubble.
- All bubbles have `max-w-[80%]`.

### 4.3 Typing Indicator

Three dots with CSS opacity bounce animation inside an assistant-style bubble. Shown when `isWaiting` is true or when `showTypingIndicator` is true and the last message is from the user.

### 4.4 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />`.                        |
| Empty       | Renders `<Fallback content={content} />`.                              |
| Populated   | Full chat interface with messages and input.                            |

---

## 5. Interactions

### 5.1 User Actions

| Action             | Trigger                  | Result                                                      |
|--------------------|--------------------------|-------------------------------------------------------------|
| Send message       | Click Send / press Enter | Adds user message optimistically, calls `callTool(respondTool, { message, history })`. |
| Click suggestion   | Click suggestion chip    | Sends the suggestion text as a message.                     |
| Type in input      | Keyboard input           | Updates local input state. Send button enabled when non-empty. |

### 5.2 Send Flow

1. Add user message to local state as `{ role: "user", status: "sending" }`.
2. Call `onCallTool(respondTool, { message: inputText, history: messages })`.
3. On success: update user message status to `"sent"`.
4. On error: update user message status to `"error"`.
5. In Storybook (no real tool), `mockCallTool` just logs.

---

## 5b. Model Context Updates

None.

---

## 5c. Display Mode

Not applicable. The view stays inline-only.

---

## 5d. Cancellation

Default. No special handling beyond shared Fallback behaviour.

---

## 6. Streaming

Not implemented.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- Input is a native `<input>` element with placeholder text.
- Send button has visible "Send" label.
- Messages are semantically grouped with proper alignment for screen readers.
- Typing indicator is visual-only.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/chat/src/ssr-entry.tsx`
- **Renders:** `ChatRenderer` via `renderToString`
- **Config:** `apps/chat/vite.config.ssr.ts`
- **Output:** `apps/chat/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal chat with messages array and respondTool.
- Accepts all message roles (user, assistant, system).
- Accepts all message statuses (sending, sent, error).
- Accepts optional title, placeholder, suggestions, showTypingIndicator.
- Rejects missing messages or respondTool.
- Rejects wrong type.
- Rejects message missing required fields (id, role, content).

### Rendering

- User messages aligned right with primary background.
- Assistant messages aligned left with muted background.
- System messages centered with italic muted text.
- Error status shows ring and "Failed to send" text.
- Typing indicator shows three animated dots.

### Interaction

- Send button calls callTool with respondTool and message payload.
- Enter key sends the message.
- Suggestion chips send their text as a message.
- Send button disabled when input is empty.

---

## 12. Storybook Stories

Story file: `apps/chat/src/Chat.stories.tsx`

| Story            | Description                                              |
|------------------|----------------------------------------------------------|
| CustomerSupport  | 4 messages with suggestions and title                    |
| DataExplorer     | System message, 2 user/assistant exchanges, no suggestions |
| Empty            | No messages, placeholder text, 3 suggestions             |
