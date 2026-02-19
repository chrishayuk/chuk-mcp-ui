# Component Spec: @chuk/view-poll

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-poll`                                                     |
| Type        | `poll`                                                                |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Live poll and voting View that supports single-choice, multi-choice, rating, and ranking question types with animated result bars and multi-question survey navigation via `callTool`. |

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

## 3. Schema

### 3.1 Root -- `PollContent`

```typescript
interface PollContent {
  type: "poll";
  version: "1.0";
  title: string;
  description?: string;
  questions: PollQuestion[];
  settings?: PollSettings;
  voteTool: string;
  resultsTool?: string;
}

interface PollQuestion {
  id: string;
  type: "single-choice" | "multi-choice" | "rating" | "ranking";
  prompt: string;
  image?: { url: string; alt?: string };
  options: PollOption[];
  maxSelections?: number;
}

interface PollOption {
  id: string;
  label: string;
  image?: { url: string; alt?: string };
  color?: string;
}

interface PollResults {
  questionId: string;
  votes: PollVote[];
  totalVotes: number;
}

interface PollVote {
  optionId: string;
  count: number;
  percentage: number;
}

interface PollSettings {
  showResults?: "after-vote" | "live" | "after-close";
  allowChange?: boolean;
  multiQuestion?: boolean;
  anonymous?: boolean;
  closedMessage?: string;
}
```

### 3.2 Defaults

| Field                   | Default                                  |
|-------------------------|------------------------------------------|
| `description`           | `undefined` (not rendered)               |
| `settings`              | `undefined` (defaults applied per field) |
| `settings.showResults`  | `"after-vote"`                           |
| `settings.allowChange`  | `false`                                  |
| `settings.multiQuestion`| `false`                                  |
| `settings.anonymous`    | `false`                                  |
| `settings.closedMessage`| `undefined` (not rendered)               |
| `resultsTool`           | `undefined`                              |
| `question.image`        | `undefined` (not rendered)               |
| `question.maxSelections`| `undefined` (no limit for multi-choice)  |
| `option.image`          | `undefined` (not rendered)               |
| `option.color`          | CSS variable `--color-primary`           |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column (`h-full flex flex-col`). Header area with title and description. Question area is centered with `max-w-lg` Card.

### 4.2 Question Types

| Type            | Rendering                                                            |
|-----------------|----------------------------------------------------------------------|
| `single-choice` | Vertical stack of radio-like cards. Selected card has `ring-2 ring-primary bg-primary/5`. |
| `multi-choice`  | Vertical stack of checkbox-like cards. Shows `maxSelections` limit. Selected cards have `ring-2 ring-primary bg-primary/5`. |
| `rating`        | Horizontal row of star characters (`text-3xl`). Filled stars: `text-amber-500`. Unfilled: `text-muted-foreground/30`. |
| `ranking`       | Vertical list with numbered positions. Up/down arrow buttons for reordering. Animated layout transitions. |

### 4.3 Multi-Question Navigation

When `settings.multiQuestion` is `true` and there are multiple questions:
- Progress bar showing "Question {n}/{total}" with animated fill bar
- Navigation dots (clickable to jump to any question)
- Previous/Next buttons below the question card

### 4.4 Results Display

After voting, animated horizontal bars show results:
- Option label on the left
- Percentage and vote count on the right
- Bar track: `bg-muted h-4 rounded-full`
- Bar fill: `bg-primary` (or `option.color`), animated from 0 to percentage width
- "Total votes: {n}" below bars

### 4.5 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Voting      | Question card with options and Vote button.                             |
| Voted       | Results bars shown for current question. Optional "Change Vote" button. |
| Complete    | Summary of all questions with results bars. "Thank you for voting!" badge. |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.6 Animation

- Header: `fadeIn` variant
- Question card: `slideUp` variant
- Option lists: `listContainer` + `listItem` stagger variants
- Star ratings: `pressable` hover/tap variants
- Result bars: `motion.div` with width animation from 0 to percentage
- Progress bar: animated width transition
- Ranking items: `layout` animation for reorder transitions

### 4.7 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Description, question type badges, metadata.     |
| `--color-muted`              | Result bar track, unselected dots, hover states.  |
| `--color-primary`            | Selected option rings, result bar fill, active dots. |
| `--color-border`             | Card borders, option card borders.                |

---

## 5. Interactions

### 5.1 User Actions

| Action          | Trigger           | Result                                                     |
|-----------------|-------------------|------------------------------------------------------------|
| Select option   | Click option card | Updates selections state for current question.             |
| Toggle checkbox | Click multi-choice| Adds/removes option from selections (respects maxSelections). |
| Rate            | Click star        | Sets rating to clicked star position (fills up to that star). |
| Reorder         | Click up/down     | Moves ranking item up or down in the order.                |
| Vote            | Click Vote button | Calls `callTool(voteTool, { questionId, selections })`.   |
| Change vote     | Click Change Vote | Resets voted state and results for current question.       |
| Navigate        | Click dots/arrows | Changes `currentQuestionIndex`.                            |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

Vote button invokes `callTool(voteTool, { questionId, selections })`. When `onCallTool` is undefined (storybook), results are simulated locally with randomized vote counts (selected option gets highest count).

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

---

## 8. CSP Requirements

External network access may be required if `question.image.url` or `option.image.url` points to an external origin. The host application's CSP must allow `img-src` for image origins.

---

## 9. Accessibility

- Semantic heading structure (h1 for title, h2 for question prompt).
- Radio/checkbox visual indicators with appropriate ARIA labels.
- Star rating buttons include `aria-label` with star label text.
- Ranking up/down buttons include `aria-label` describing the action.
- Navigation dots include `aria-label` for question number.
- Vote button is disabled until a selection is made.
- All interactive elements are native `<button>` elements.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid PollContent with required fields.
- Accepts full PollContent with all optional fields and settings.
- Accepts all question types: single-choice, multi-choice, rating, ranking.
- Rejects missing questions.
- Rejects missing voteTool.
- Rejects wrong type.
- Rejects invalid question type.
- Rejects missing title.

### Rendering

- Title renders as h1 when provided.
- Description renders as subtitle text.
- Single-choice options render as radio-style cards.
- Multi-choice options render as checkbox-style cards with max selections indicator.
- Rating options render as star row with correct fill state.
- Ranking options render as numbered list with up/down buttons.
- Results bars render with animated widths after voting.
- Multi-question navigation renders when enabled.
- "Thank you for voting!" badge renders after all questions answered.

### Interaction

- Selecting an option enables the Vote button.
- Vote button calls callTool with correct tool name and arguments.
- Change Vote button resets the voted state.
- Multi-choice respects maxSelections limit.
- Ranking up/down buttons reorder items correctly.
- Navigation dots and arrows change active question.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/poll/src/Poll.stories.tsx`

| Story        | Description                                                                          |
|--------------|--------------------------------------------------------------------------------------|
| QuickPoll    | Single question, single-choice, 4 options with custom colors.                       |
| Survey       | 3 mixed questions (single-choice, multi-choice, rating), multiQuestion navigation.  |
| LiveResults  | Single question, single-choice, 4 options with custom colors.                       |
| Rating       | Single rating question with 5-star display.                                         |
