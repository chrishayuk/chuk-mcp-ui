import { useState, useEffect, useCallback, useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Separator,
  cn,
} from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideUp, pressable } from "@chuk/view-ui/animations";
import type {
  QuizContent,
  QuizQuestion,
  QuizOption,
  QuizResult,
  QuizSettings,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper (connects to MCP host)                                */
/* ------------------------------------------------------------------ */

export function QuizView() {
  const { data, content, callTool, isConnected } =
    useView<QuizContent>("quiz", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <QuizRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface QuizRendererProps {
  data: QuizContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
  /** Allow stories to pre-seed results for the Results screen */
  initialScreen?: Screen;
  initialResults?: QuizResult[];
}

/* ------------------------------------------------------------------ */
/*  State-machine types                                                */
/* ------------------------------------------------------------------ */

type Screen = "start" | "question" | "answered" | "results";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Fisher-Yates shuffle (returns a new array) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Compute total points from results */
function totalPoints(results: QuizResult[]): number {
  return results.reduce((s, r) => s + r.pointsEarned, 0);
}

/** Compute max possible points */
function maxPoints(questions: QuizQuestion[]): number {
  return questions.reduce((s, q) => s + (q.points ?? 1), 0);
}

/** Group results by category */
function categoryBreakdown(
  questions: QuizQuestion[],
  results: QuizResult[]
): { category: string; correct: number; total: number }[] {
  const map = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const cat = q.category ?? "General";
    const entry = map.get(cat) ?? { correct: 0, total: 0 };
    entry.total++;
    const result = results.find((r) => r.questionId === q.id);
    if (result?.correct) entry.correct++;
    map.set(cat, entry);
  }
  return Array.from(map.entries()).map(([category, v]) => ({
    category,
    ...v,
  }));
}

/* ------------------------------------------------------------------ */
/*  Main renderer                                                      */
/* ------------------------------------------------------------------ */

export function QuizRenderer({
  data,
  onCallTool,
  initialScreen = "start",
  initialResults,
}: QuizRendererProps) {
  const {
    title,
    description,
    questions: rawQuestions,
    settings = {} as QuizSettings,
    validateTool,
  } = data;

  const {
    timeLimit,
    timeLimitMode = "per-question",
    showExplanation = true,
    showProgress = true,
    showScore = true,
    shuffleQuestions = false,
    shuffleOptions = false,
    passingScore,
  } = settings;

  /* ---- State ---- */
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [questions, setQuestions] = useState<QuizQuestion[]>(rawQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>(initialResults ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [expandedReview, setExpandedReview] = useState<Set<string>>(new Set());

  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];
  const score = totalPoints(results);

  /* ---- Shuffled options for the current question ---- */
  const displayOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleOptions
      ? shuffle(currentQuestion.options)
      : currentQuestion.options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, shuffleOptions, currentQuestion?.id]);

  /* ---- Timer ---- */
  useEffect(() => {
    if (screen !== "question" || timeLimit == null) return;

    if (timeLimitMode === "per-question") {
      const perQ = currentQuestion?.timeLimit ?? timeLimit;
      setTimeRemaining(perQ);
    }
    // For "total" mode, timeRemaining is set once at start
  }, [screen, currentIndex, timeLimitMode, timeLimit, currentQuestion]);

  useEffect(() => {
    if (
      screen !== "question" ||
      timeRemaining == null ||
      timeRemaining <= 0
    )
      return;

    const id = setInterval(() => {
      setTimeRemaining((t) => {
        if (t == null) return null;
        if (t <= 1) {
          clearInterval(id);
          // Time's up -- auto-advance with incorrect
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, timeRemaining != null && timeRemaining > 0, currentIndex]);

  /* ---- Handlers ---- */

  const handleStart = useCallback(() => {
    const ordered = shuffleQuestions ? shuffle(rawQuestions) : rawQuestions;
    setQuestions(ordered);
    setCurrentIndex(0);
    setResults([]);
    setSelectedId(null);
    setCurrentResult(null);
    if (timeLimit != null && timeLimitMode === "total") {
      setTimeRemaining(timeLimit);
    }
    setScreen("question");
  }, [rawQuestions, shuffleQuestions, timeLimit, timeLimitMode]);

  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (screen !== "question" || !currentQuestion) return;
      setSelectedId(optionId);

      let result: QuizResult;

      if (onCallTool) {
        try {
          // Call the server validate tool
          await onCallTool(validateTool, {
            questionId: currentQuestion.id,
            selectedOptionId: optionId,
          });
          // For now, we simulate locally since callTool doesn't return data
          result = simulateResult(currentQuestion, optionId);
        } catch {
          result = simulateResult(currentQuestion, optionId);
        }
      } else {
        // Storybook mode: simulate locally (first option is correct)
        result = simulateResult(currentQuestion, optionId);
      }

      setCurrentResult(result);
      setResults((prev) => [...prev, result]);
      setScreen("answered");
    },
    [screen, currentQuestion, onCallTool, validateTool]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setScreen("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedId(null);
      setCurrentResult(null);
      setScreen("question");
    }
  }, [currentIndex, questions.length]);

  const handleTimeUp = useCallback(() => {
    if (!currentQuestion) return;
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedOptionId: "",
      correct: false,
      correctOptionId: currentQuestion.options[0]?.id ?? "",
      pointsEarned: 0,
    };
    setCurrentResult(result);
    setResults((prev) => [...prev, result]);
    setScreen("answered");
  }, [currentQuestion]);

  const handleRetry = useCallback(() => {
    setScreen("start");
    setCurrentIndex(0);
    setResults([]);
    setSelectedId(null);
    setCurrentResult(null);
    setTimeRemaining(null);
    setExpandedReview(new Set());
  }, []);

  const toggleReview = useCallback((qId: string) => {
    setExpandedReview((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }, []);

  /* ---- Render ---- */

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <AnimatePresence mode="wait">
        {screen === "start" && (
          <StartScreen
            key="start"
            title={title}
            description={description}
            questionCount={rawQuestions.length}
            timeLimit={timeLimit}
            timeLimitMode={timeLimitMode}
            passingScore={passingScore}
            onStart={handleStart}
          />
        )}

        {(screen === "question" || screen === "answered") &&
          currentQuestion && (
            <QuestionScreen
              key={`q-${currentIndex}`}
              question={currentQuestion}
              options={displayOptions}
              index={currentIndex}
              total={questions.length}
              score={score}
              showProgress={showProgress}
              showScore={showScore}
              showExplanation={showExplanation}
              timeRemaining={timeRemaining}
              answered={screen === "answered"}
              selectedId={selectedId}
              result={currentResult}
              isLast={currentIndex + 1 >= questions.length}
              onSelect={handleSelectOption}
              onNext={handleNext}
            />
          )}

        {screen === "results" && (
          <ResultsScreen
            key="results"
            title={title}
            questions={questions}
            results={results}
            passingScore={passingScore}
            expandedReview={expandedReview}
            onToggleReview={toggleReview}
            onRetry={handleRetry}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Simulate result (Storybook / fallback): first option is correct    */
/* ------------------------------------------------------------------ */

function simulateResult(question: QuizQuestion, selectedId: string): QuizResult {
  const correctId = question.options[0]?.id ?? "";
  const correct = selectedId === correctId;
  return {
    questionId: question.id,
    selectedOptionId: selectedId,
    correct,
    correctOptionId: correctId,
    pointsEarned: correct ? (question.points ?? 1) : 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Screen: Start                                                      */
/* ------------------------------------------------------------------ */

interface StartScreenProps {
  title: string;
  description?: string;
  questionCount: number;
  timeLimit?: number;
  timeLimitMode?: string;
  passingScore?: number;
  onStart: () => void;
}

function StartScreen({
  title,
  description,
  questionCount,
  timeLimit,
  timeLimitMode,
  passingScore,
  onStart,
}: StartScreenProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="flex-1 flex items-center justify-center p-6"
    >
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">{title}</h1>

          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}

          <Separator className="my-4" />

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {questionCount}
              </span>{" "}
              questions
            </div>

            {timeLimit != null && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {timeLimit}s
                </span>{" "}
                {timeLimitMode === "total"
                  ? "total time"
                  : "per question"}
              </div>
            )}

            {passingScore != null && (
              <div className="flex items-center gap-2">
                Passing score:{" "}
                <span className="font-medium text-foreground">
                  {passingScore}%
                </span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button variant="default" size="lg" onClick={onStart}>
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen: Question                                                   */
/* ------------------------------------------------------------------ */

interface QuestionScreenProps {
  question: QuizQuestion;
  options: QuizOption[];
  index: number;
  total: number;
  score: number;
  showProgress: boolean;
  showScore: boolean;
  showExplanation: boolean;
  timeRemaining: number | null;
  answered: boolean;
  selectedId: string | null;
  result: QuizResult | null;
  isLast: boolean;
  onSelect: (optionId: string) => void;
  onNext: () => void;
}

function QuestionScreen({
  question,
  options,
  index,
  total,
  score,
  showProgress,
  showScore,
  showExplanation,
  timeRemaining,
  answered,
  selectedId,
  result,
  isLast,
  onSelect,
  onNext,
}: QuestionScreenProps) {
  const progressPct = ((index + (answered ? 1 : 0)) / total) * 100;

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="flex-1 flex flex-col"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 p-3 border-b">
        {showProgress && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-medium whitespace-nowrap">
              Question {index + 1}/{total}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {showScore && (
            <Badge variant="secondary" className="tabular-nums">
              {score} pts
            </Badge>
          )}

          {timeRemaining != null && (
            <span
              className={cn(
                "text-lg font-mono tabular-nums min-w-[3ch] text-right",
                timeRemaining <= 5 && "text-destructive animate-pulse",
                timeRemaining > 5 && timeRemaining <= 10 && "text-destructive"
              )}
            >
              {timeRemaining}s
            </span>
          )}
        </div>
      </div>

      {/* Question body */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <Card className="w-full max-w-[600px]">
          <CardContent className="p-6">
            {question.category && (
              <Badge variant="secondary">{question.category}</Badge>
            )}

            <h2 className="text-lg font-semibold mt-2">{question.prompt}</h2>

            {question.image && (
              <img
                src={question.image.url}
                alt={question.image.alt ?? "Question image"}
                className="max-h-[200px] rounded mx-auto mt-3 object-cover"
              />
            )}

            {/* Options */}
            <div className="mt-6">
              {question.type === "true-false" ? (
                <TrueFalseOptions
                  options={options}
                  answered={answered}
                  selectedId={selectedId}
                  result={result}
                  onSelect={onSelect}
                />
              ) : question.type === "image-choice" ? (
                <ImageChoiceOptions
                  options={options}
                  answered={answered}
                  selectedId={selectedId}
                  result={result}
                  onSelect={onSelect}
                />
              ) : (
                <MultipleChoiceOptions
                  options={options}
                  answered={answered}
                  selectedId={selectedId}
                  result={result}
                  onSelect={onSelect}
                />
              )}
            </div>

            {/* Post-answer feedback */}
            {answered && result && (
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="mt-4"
              >
                {result.correct ? (
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Correct! +{result.pointsEarned}{" "}
                    {result.pointsEarned === 1 ? "point" : "points"}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-destructive">
                    {selectedId === ""
                      ? "Time's up!"
                      : "Incorrect"}
                  </p>
                )}

                {showExplanation && question.explanation && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    {question.explanation}
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <Button variant="default" onClick={onNext}>
                    {isLast ? "See Results" : "Next Question"}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Option renderers                                                   */
/* ------------------------------------------------------------------ */

interface OptionGroupProps {
  options: QuizOption[];
  answered: boolean;
  selectedId: string | null;
  result: QuizResult | null;
  onSelect: (id: string) => void;
}

function optionClasses(
  optionId: string,
  answered: boolean,
  selectedId: string | null,
  result: QuizResult | null
): string {
  if (!answered) {
    const selected = optionId === selectedId;
    return cn(
      "border rounded-lg p-3 cursor-pointer transition",
      selected ? "ring-2 ring-primary" : "hover:bg-muted/50"
    );
  }
  // Answered state
  const isCorrect = optionId === result?.correctOptionId;
  const isSelected = optionId === selectedId;
  if (isCorrect) {
    return "border rounded-lg p-3 bg-emerald-50 border-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-500";
  }
  if (isSelected && !isCorrect) {
    return "border rounded-lg p-3 bg-red-50 border-red-500 dark:bg-red-950/20 dark:border-red-500";
  }
  return "border rounded-lg p-3 opacity-50";
}

function MultipleChoiceOptions({
  options,
  answered,
  selectedId,
  result,
  onSelect,
}: OptionGroupProps) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <motion.div
          key={opt.id}
          variants={pressable}
          whileTap={answered ? undefined : "pressed"}
          className={optionClasses(opt.id, answered, selectedId, result)}
          onClick={() => !answered && onSelect(opt.id)}
        >
          <span className="text-sm font-medium">{opt.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function TrueFalseOptions({
  options,
  answered,
  selectedId,
  result,
  onSelect,
}: OptionGroupProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((opt) => (
        <motion.div
          key={opt.id}
          variants={pressable}
          whileTap={answered ? undefined : "pressed"}
          className={cn(
            optionClasses(opt.id, answered, selectedId, result),
            "flex items-center justify-center py-4 text-base font-semibold"
          )}
          onClick={() => !answered && onSelect(opt.id)}
        >
          {opt.label}
        </motion.div>
      ))}
    </div>
  );
}

function ImageChoiceOptions({
  options,
  answered,
  selectedId,
  result,
  onSelect,
}: OptionGroupProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((opt) => (
        <motion.div
          key={opt.id}
          variants={pressable}
          whileTap={answered ? undefined : "pressed"}
          className={cn(
            optionClasses(opt.id, answered, selectedId, result),
            "flex flex-col items-center gap-2 p-2"
          )}
          onClick={() => !answered && onSelect(opt.id)}
        >
          {opt.image && (
            <img
              src={opt.image.url}
              alt={opt.image.alt ?? opt.label}
              className="w-full h-24 object-cover rounded"
            />
          )}
          <span className="text-sm font-medium text-center">{opt.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen: Results                                                    */
/* ------------------------------------------------------------------ */

interface ResultsScreenProps {
  title: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  passingScore?: number;
  expandedReview: Set<string>;
  onToggleReview: (qId: string) => void;
  onRetry: () => void;
}

function ResultsScreen({
  title,
  questions,
  results,
  passingScore,
  expandedReview,
  onToggleReview,
  onRetry,
}: ResultsScreenProps) {
  const earned = totalPoints(results);
  const max = maxPoints(questions);
  const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
  const passed = passingScore != null ? pct >= passingScore : undefined;
  const categories = categoryBreakdown(questions, results);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="flex-1 flex items-center justify-center p-6 overflow-y-auto"
    >
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">Quiz Complete!</h1>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>

          <Separator className="my-4" />

          {/* Score */}
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-primary tabular-nums">
              {earned}/{max}
            </div>
            <div className="text-lg text-muted-foreground mt-1">{pct}%</div>

            {passed != null && (
              <div className="mt-2">
                <Badge variant={passed ? "default" : "destructive"}>
                  {passed ? "Passed" : "Failed"} ({passingScore}% required)
                </Badge>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Category breakdown */}
          {categories.length > 1 && (
            <>
              <h3 className="text-sm font-semibold mb-3">By Category</h3>
              <div className="space-y-3 mb-4">
                {categories.map((cat) => {
                  const catPct =
                    cat.total > 0
                      ? Math.round((cat.correct / cat.total) * 100)
                      : 0;
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.category}</span>
                        <span className="text-muted-foreground">
                          {cat.correct}/{cat.total}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
            </>
          )}

          {/* Per-question review */}
          <h3 className="text-sm font-semibold mb-3">Question Review</h3>
          <div className="space-y-2">
            {questions.map((q, i) => {
              const r = results.find((res) => res.questionId === q.id);
              const expanded = expandedReview.has(q.id);
              const selectedOpt = q.options.find(
                (o) => o.id === r?.selectedOptionId
              );
              const correctOpt = q.options.find(
                (o) => o.id === r?.correctOptionId
              );

              return (
                <div
                  key={q.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition"
                    onClick={() => onToggleReview(q.id)}
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                        r?.correct
                          ? "bg-emerald-500"
                          : "bg-destructive"
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm truncate">
                      {q.prompt}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r?.pointsEarned ?? 0}/{q.points ?? 1}
                    </span>
                    <span
                      className={cn(
                        "text-xs transition-transform",
                        expanded && "rotate-180"
                      )}
                    >
                      &#9660;
                    </span>
                  </button>

                  {expanded && r && (
                    <div className="px-3 pb-3 text-sm space-y-1 border-t pt-2">
                      <div>
                        <span className="text-muted-foreground">
                          Your answer:{" "}
                        </span>
                        <span
                          className={
                            r.correct
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-destructive"
                          }
                        >
                          {r.selectedOptionId === ""
                            ? "No answer (time expired)"
                            : selectedOpt?.label ?? r.selectedOptionId}
                        </span>
                      </div>
                      {!r.correct && (
                        <div>
                          <span className="text-muted-foreground">
                            Correct answer:{" "}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {correctOpt?.label ?? r.correctOptionId}
                          </span>
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-muted-foreground italic mt-1">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button variant="default" onClick={onRetry}>
              Retry
            </Button>
            <Button variant="outline" disabled>
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
