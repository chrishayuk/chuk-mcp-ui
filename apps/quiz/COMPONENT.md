# Component Spec: @chuk/view-quiz

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-quiz`                                                     |
| Type        | `quiz`                                                                |
| Version     | `1.0`                                                                 |
| Category    | Tier 2 -- Interactive                                                 |
| Description | Fully interactive quiz View with multi-screen state machine, timer support, multiple question types (multiple-choice, true-false, image-choice), server-side answer validation via `callTool`, and a comprehensive results screen with category breakdown. |

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

### 3.1 Root -- `QuizContent`

```typescript
interface QuizContent {
  type: "quiz";
  version: "1.0";
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings?: QuizSettings;
  validateTool: string;
  completeTool?: string;
}
```

### 3.2 `QuizQuestion`

```typescript
interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "image-choice";
  prompt: string;
  image?: { url: string; alt?: string };
  options: QuizOption[];
  timeLimit?: number;
  explanation?: string;
  points?: number;
  category?: string;
}
```

### 3.3 `QuizOption`

```typescript
interface QuizOption {
  id: string;
  label: string;
  image?: { url: string; alt?: string };
}
```

### 3.4 `QuizSettings`

```typescript
interface QuizSettings {
  timeLimit?: number;
  timeLimitMode?: "total" | "per-question";
  showExplanation?: boolean;
  showProgress?: boolean;
  showScore?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  passingScore?: number;
}
```

### 3.5 `QuizResult` (runtime, returned by validateTool)

```typescript
interface QuizResult {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  correctOptionId: string;
  pointsEarned: number;
}
```

### 3.6 Defaults

| Field                       | Default          |
|-----------------------------|------------------|
| `description`               | `undefined`      |
| `settings`                  | `{}`             |
| `completeTool`              | `undefined`      |
| `settings.timeLimitMode`    | `"per-question"` |
| `settings.showExplanation`  | `true`           |
| `settings.showProgress`     | `true`           |
| `settings.showScore`        | `true`           |
| `settings.shuffleQuestions` | `false`          |
| `settings.shuffleOptions`   | `false`          |
| `question.points`           | `1`              |

---

## 4. Rendering

### 4.1 State Machine

The quiz operates as a multi-screen state machine with four screens:

| Screen     | Description                                                              |
|------------|--------------------------------------------------------------------------|
| `start`    | Title card with quiz info and "Start Quiz" button.                       |
| `question` | Active question with options, progress bar, timer, and score.            |
| `answered` | Same as question but with correct/wrong feedback, explanation, and next. |
| `results`  | Final score, category breakdown, per-question review, retry button.      |

### 4.2 Screen: Start

Centered Card (max-w-lg). Displays title, optional description, question count, time limit info, passing score. Single "Start Quiz" button. Uses `fadeIn` animation.

### 4.3 Screen: Question

- **Header bar**: Progress text and bar, running score badge, countdown timer.
- **Question card**: Category badge, prompt text, optional image, option buttons.
- **Option types**:
  - Multiple-choice: Vertical stack of clickable cards with hover and ring states.
  - True-false: Two large side-by-side buttons (grid-cols-2).
  - Image-choice: 2x2 grid of image cards with labels.
- **Selection states**: `ring-2 ring-primary` for selected, green/red backgrounds for correct/incorrect after answer.
- Uses `slideUp` animation per question (keyed by index).

### 4.4 Screen: Answered

Extends question screen with:
- Correct/incorrect feedback text.
- Explanation (if `showExplanation` is true and question has one).
- "Next Question" or "See Results" button.
- Uses `fadeIn` for the feedback area.

### 4.5 Screen: Results

Centered Card (max-w-lg). Shows:
- "Quiz Complete!" header with quiz title.
- Large score display (points and percentage).
- Pass/fail badge if `passingScore` is set.
- Category breakdown with horizontal progress bars (when multiple categories exist).
- Expandable per-question review list with correct/incorrect indicators.
- "Retry" and "Export Results" (placeholder) buttons.
- Uses `fadeIn` animation.

### 4.6 Timer

- `per-question` mode: Resets timer on each question. Uses question's `timeLimit` or global `settings.timeLimit`.
- `total` mode: Single countdown across all questions.
- Visual: Normal text, `text-destructive` under 10s, `animate-pulse` under 5s.
- On expiry: Auto-advances with incorrect answer.

### 4.7 Shuffling

- If `shuffleQuestions`, questions are shuffled (Fisher-Yates) on quiz start.
- If `shuffleOptions`, each question's options are shuffled when displayed.

---

## 5. Interactions

### 5.1 User Actions

| Action          | Trigger                | Result                                                      |
|-----------------|------------------------|-------------------------------------------------------------|
| Start quiz      | Click "Start Quiz"     | Transitions to first question.                              |
| Select option   | Click an option card   | Calls `callTool(validateTool, { questionId, selectedOptionId })`, shows feedback. |
| Next question   | Click "Next Question"  | Advances to next question or results.                       |
| See results     | Click "See Results"    | Transitions to results screen.                              |
| Retry           | Click "Retry"          | Resets all state and returns to start screen.               |
| Toggle review   | Click question row     | Expands/collapses per-question review detail.               |

### 5.2 Tool Calls

- **validateTool**: Called when user selects an answer. Receives `{ questionId, selectedOptionId }`. Expected to return `QuizResult`.
- **completeTool**: Reserved for future use (called when quiz finishes).

### 5.3 Storybook Mode

When `onCallTool` is undefined (or in Storybook), validation is simulated locally: the first option in each question is treated as correct. This allows full interactivity without a real MCP server.

---

## 6. Streaming

Not implemented. Quiz data is expected to be complete on initial render.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

---

## 8. CSP Requirements

- `img-src` must allow the domains used in question/option images.
- For Storybook stories, `picsum.photos` is used.

---

## 9. Accessibility

- Option cards are clickable `div` elements with `cursor-pointer`.
- Review items use native `<button>` elements for expand/collapse.
- Correct/incorrect states conveyed by both colour and text labels.
- Timer provides visual urgency cues (colour change and pulse animation).

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation (JSON Schema)

- Accepts minimal quiz with one question and validateTool.
- Accepts full quiz with all settings, all question types, images, explanations.
- Rejects missing questions array.
- Rejects wrong type (e.g., "form" instead of "quiz").
- Rejects missing validateTool.
- Rejects missing version.
- Accepts unknown additional fields.
- Accepts all three question types.

### Schema Validation (Zod)

- Same cases as JSON Schema plus:
- Rejects invalid question type (e.g., "essay").
- Rejects invalid timeLimitMode (e.g., "infinite").

### Rendering

- Start screen shows title, description, question count.
- Timer displays and counts down correctly.
- Options highlight on selection.
- Correct/incorrect feedback displayed after answer.
- Results screen shows accurate score and category breakdown.

### Interaction

- Selecting an option calls callTool with validateTool.
- Timer expiry auto-advances with incorrect answer.
- Retry resets all state to start screen.

---

## 12. Storybook Stories

Story file: `apps/quiz/src/Quiz.stories.tsx`

| Story             | Description                                                              |
|-------------------|--------------------------------------------------------------------------|
| GeneralKnowledge  | 5 multiple-choice questions with categories, 30s timer, explanations     |
| TrueFalse         | 3 true-false questions, no timer, simple scoring                         |
| ImageQuiz         | 3 image-choice questions with picsum.photos images                       |
| Results           | Pre-rendered results screen with 5 pre-populated results (3 correct, 2 wrong) |
